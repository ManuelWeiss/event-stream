package controllers

import play.api.mvc._
import play.api.libs.json.JsValue
import play.api.libs.json.Json
import play.api.libs.iteratee.{Concurrent, Enumeratee}
import play.api.libs.EventSource
import play.api.libs.concurrent.Execution.Implicits._

object ChatApplication extends Controller {

  /** Central hub for distributing chat messages */
  val (chatOut, chatChannel) = Concurrent.broadcast[JsValue]

  /** Controller action serving AngularJS chat page */
  def index = Action { Ok(views.html.index("Chat using Server Sent Events and AngularJS")) }

  /** Controller action serving React chat page */
  def indexReact = Action { Ok(views.html.react("Chat using Server Sent Events and React")) }

  /** Controller action serving Pie chat page */
  def indexPie = Action { Ok(views.html.pie("Moonfruit Data Visualization")) }

  /** Controller action serving Bullet chat page */
  def indexBullet = Action { Ok(views.html.bullet("Moonfruit Data Visualization")) }

  /** Controller action serving Physics registration page */
  def indexPhysicsRegistrations = Action { Ok(views.html.physicsRegistrations("User registrations - Moonfruit Data Visualization")) }

  /** Controller action serving Physics registration per page page */
  def indexPhysicsRegistrationsPage = Action { Ok(views.html.physicsRegistrationsPage("User registrations per page - Moonfruit Data Visualization")) }

  /** Controller action for POSTing chat messages */
  def postMessage = Action(parse.json) { req => chatChannel.push(req.body); Ok }

  /** Controller action for adding chat messages via GET */
  def addMessage(payload: String) = Action { req => chatChannel.push(Json.parse(payload)); Ok }

  /** Enumeratee for filtering messages based on stream */
  def filter(stream: String) = Enumeratee.filter[JsValue] { json: JsValue => (json \ "stream").as[String] == stream }

  /** Enumeratee for detecting disconnect of SSE stream */
  def connDeathWatch(addr: String): Enumeratee[JsValue, JsValue] =
    Enumeratee.onIterateeDone{ () => println(addr + " - SSE disconnected") }

  /** Controller action serving activity based on stream */
  def chatFeed(stream: String) = Action { req =>
    println(req.remoteAddress + " - SSE connected")
    Ok.feed(chatOut
      &> filter(stream)
      &> Concurrent.buffer(50)
      &> connDeathWatch(req.remoteAddress)
      &> EventSource()
    ).as("text/event-stream")
  }

}
