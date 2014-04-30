package akka

import akka.actor._

import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._

import scala.language.postfixOps
import scala.concurrent.duration._

import controllers.ChatApplication
import org.joda.time.DateTime
import scala.util.Random

object ChatActors {

  /** SSE-Chat actor system */
  val system = ActorSystem("sse-chat")

  /** Supervisor for test user actors */
  val supervisor = system.actorOf(Props(new Supervisor()), "ChatterSupervisor")

  case object Talk
}

/** Supervisor initiating sample event actors and scheduling their talking */
class Supervisor() extends Actor {

  val user1 = context.actorOf(Props(new Chatter("user1", UserEvents.user1)))
  context.system.scheduler.schedule(1 seconds, 8 seconds, user1, ChatActors.Talk)

  val user2 = context.actorOf(Props(new Chatter("user2", UserEvents.user2)))
  context.system.scheduler.schedule(3 seconds, 8 seconds, user2, ChatActors.Talk)

  val user3 = context.actorOf(Props(new Chatter("user3", UserEvents.user3)))
  context.system.scheduler.schedule(5 seconds, 8 seconds, user3, ChatActors.Talk)

  def receive = { case _ => }
}

/** Chat participant actors picking events at random when told to talk */
class Chatter(name: String, events: Seq[String]) extends Actor {

  def receive = {
    case ChatActors.Talk  => {
      val now: String = DateTime.now.toString
      val event = events(Random.nextInt(events.size))
      val msg = Json.obj("room" -> "room1", "text" -> event, "user" ->  name, "time" -> now )

      ChatApplication.chatChannel.push(msg)
    }
  }
}

object UserEvents {
  val user1 = Seq("is on homepage",
                "is on blog",
                "is on pricing page",
                "signed up for trial",
                "clicked on signup")
  val user2 = Seq("is on homepage",
                "is on kickstart page",
                "is on careers page",
                "signed up for kickstart")
  val user3 = Seq("is on homepage",
                "logged in",
                "is on dashboard page",
                "logged out",
                "is editing page",
                "created a new site")
}
