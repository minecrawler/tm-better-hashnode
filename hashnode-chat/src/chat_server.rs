use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

use actix::prelude::*;
use rand::{self, Rng, ThreadRng};


#[derive(Message)]
pub struct Message(pub String);

#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<Syn, Message>,
}

#[derive(Message)]
pub struct Disconnect {
    pub id: usize,
}

#[derive(Message)]
pub struct ClientMessage {
    /// Id of the client
    pub id: usize,
    /// Peer message
    pub msg: String,
    /// Room name
    pub room: String,
}


#[derive(Serialize, Deserialize)]
pub struct Command {
    command: String,
    data: String,
}

#[derive(Serialize, Deserialize)]
pub struct ChatMessageCommandData {
    author: String,
    message: String,
}

pub struct ChatServer {
    clients: HashMap<usize, Recipient<Syn, Message>>,
    rooms: HashMap<String, HashSet<usize>>,
    rng: RefCell<ThreadRng>,
}


impl Actor for ChatServer {
    /// We are going to use simple Context, we just need ability to communicate
    /// with other actors.
    type Context = Context<Self>;
}

impl Default for ChatServer {
    fn default() -> Self {
        // default room
        let mut rooms = HashMap::new();
        rooms.insert("Main".to_owned(), HashSet::new());

        ChatServer {
            clients: HashMap::new(),
            rooms,
            rng: RefCell::new(rand::thread_rng()),
        }
    }
}

impl Handler<ClientMessage> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: ClientMessage, _: &mut Context<Self>) {
        // todo: handle command
        self.send_message(&msg.room, msg.msg.as_str());
    }
}

/// Register new session and assign unique id to this session
impl Handler<Connect> for ChatServer {
    type Result = usize;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        println!("Someone joined");

        // register session with random id
        let id = self.rng.borrow_mut().gen::<usize>();
        self.clients.insert(id, msg.addr);

        // auto join session to Main room
        self.rooms.get_mut(&"Main".to_owned()).unwrap().insert(id);

        // notify all users in the room
        self.send_message(&"Main".to_owned(), r#"{"command": "chat-message", "data": {"author": "system", "message": "Someone joined"}}"#); // todo

        // send id back
        id
    }
}

impl Handler<Disconnect> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        println!("Someone disconnected");

        let mut rooms: Vec<String> = Vec::new();

        // remove address
        if self.clients.remove(&msg.id).is_some() {
            // remove session from all rooms
            for (name, sessions) in &mut self.rooms {
                if sessions.remove(&msg.id) {
                    rooms.push(name.to_owned());
                }
            }
        }
        // send message to other users
        for room in rooms {
            self.send_message(&room, r#"{"command": "chat-message", "data": {"author": "system", "message": "Someone left"}}"#); // todo
        }
    }
}


impl ChatServer {
    /// Send message to all users in the room
    fn send_message(&self, room: &str, message: &str) {
        if let Some(sessions) = self.rooms.get(room) {
            for id in sessions {
                if let Some(addr) = self.clients.get(id) {
                    let _ = addr.do_send(Message(message.to_owned()));
                }
            }
        }
    }
}
