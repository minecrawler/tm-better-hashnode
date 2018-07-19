#![allow(unused_variables)]
extern crate actix;
extern crate actix_web;
extern crate futures;
extern crate rand;
extern crate serde;
#[macro_use] extern crate serde_derive;
extern crate serde_json;
extern crate tokio_core;

mod chat_server;

use std::time::Instant;

use actix::prelude::*;
use actix::prelude::actix::fut;
use actix_web::{
    fs, ws, App, Error, HttpRequest, HttpResponse, server::HttpServer
};
//use ServerState;


/// This is our websocket route state, this state is shared with all route
/// instances via `HttpContext::state()`
struct ServerState {
    addr: Addr<Syn, chat_server::ChatServer>,
}

/// websocket connection is long running connection, it easier
/// to handle with an actor
struct ChatClient {
    id: usize,
    last_heartbeat: Instant,
    room: String,
}


/// do websocket handshake and start `MyWebSocket` actor
fn ws_index(r: HttpRequest<ServerState>) -> Result<HttpResponse, Error> {
    ws::start(r, ChatClient {
        id: 0,
        last_heartbeat: Instant::now(),
        room: "Main".to_owned(),
    })
}

impl Actor for ChatClient {
    type Context = ws::WebsocketContext<Self, ServerState>;

    /// Method is called on actor start.
    /// We register ws session with ChatServer
    fn started(&mut self, ctx: &mut Self::Context) {
        // register self in chat server. `AsyncContext::wait` register
        // future within context, but context waits until this future resolves
        // before processing any other events.
        // HttpContext::state() is instance of WsChatSessionState, state is shared
        // across all routes within application
        let addr: Addr<Syn, _> = ctx.address();
        ctx.state()
            .addr
            .send(chat_server::Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(res) => act.id = res,
                    // something is wrong with chat server
                    _ => ctx.stop(),
                }
                fut::ok(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        // notify chat server
        ctx.state().addr.do_send(chat_server::Disconnect { id: self.id });
        Running::Stop
    }
}

/// Handle messages from chat server, we simply send it to peer websocket
impl Handler<chat_server::Message> for ChatClient {
    type Result = ();

    fn handle(&mut self, msg: chat_server::Message, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

/// Handler for `ws::Message`
impl StreamHandler<ws::Message, ws::ProtocolError> for ChatClient {
    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        println!("WS: {:?}", msg);
        // process websocket messages
        match msg {
            ws::Message::Ping(msg) => ctx.pong(&msg),
            ws::Message::Text(text) => {
                ctx.state().addr.do_send(chat_server::ClientMessage {
                    id: self.id,
                    msg: text,
                    room: self.room.clone(),
                })
            },
            //ws::Message::Binary(bin) => ctx.binary(bin),
            ws::Message::Close(_) => {
                ctx.stop();
            }
            _ => (),
        }
    }
}

fn main() {
    let sys = actix::System::new("ws-hashnode");

    // Start chat server actor in separate thread
    let server: Addr<Syn, _> = Arbiter::start(|_| chat_server::ChatServer::default());

    // Create Http server with websocket support
    HttpServer::new(move || {
        // Websocket sessions state
        let state = ServerState {
            addr: server.clone(),
        };

        App::with_state(state)
            // websocket
            .resource("/ws", |r| r.route().f(ws_index))
            // static resources
            .handler("/", fs::StaticFiles::new("static/"))
    }).bind("127.0.0.1:1288")
        .unwrap()
        .start()
    ;

    println!("Started http server: 127.0.0.1:1288");
    let _ = sys.run();
}
