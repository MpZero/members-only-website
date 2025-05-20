const pool = require("../db/database.js");
const { body, validationResult } = require("express-validator");

const validateMsg = [
  body("title").not().isEmpty().trim().isLength({ min: 1, max: 30 }),
  body("msg").not().isEmpty().trim().isLength({ min: 1, max: 250 }),
];

async function getMessages(req, res) {
  const user = req.user;
  try {
    if (user && user.mem_status == true) {
      const rows = await pool.query(
        "SELECT messages_id, title, text, timestamp, username FROM messages JOIN users ON users.users_id = messages.user_id ORDER BY timestamp DESC"
      );

      const messages = rows.rows;
      const username = user.username;
      res.render("messageBoard", {
        title: "Message Board",
        messages,
        username,
      });
    } else if (user && user.mem_status == false) {
      const rows = await pool.query(
        "SELECT messages_id, title, text FROM messages ORDER BY messages_id DESC"
      );

      const messages = rows.rows;
      res.render("messageBoard", { title: "Message Board", messages });
    }
  } catch (error) {
    console.error("Error fetching messages: ", error);
    res.status(500).send("Error fetching messages");
  }
}

function getCreateMessage(req, res) {
  res.render("addMsgForm", { title: "Create a New Message" });
}
const postCreateMessage = [
  validateMsg,
  async (req, res) => {
    const userId = req.user.users_id;
    const title = req.body.title;
    const text = req.body.msg;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("addMsgForm", {
        title: "Create a New Message",
        errors: errors.array(),
      });
    }
    await pool.query(
      "INSERT INTO messages (title, user_id, text) VALUES ($1, $2, $3)",
      [title, userId, text]
    );

    res.redirect("/message-board");
  },
];

async function getMessageUpdate(req, res) {
  const msgId = req.params.id;

  try {
    const row = await pool.query(
      `SELECT * FROM messages WHERE messages_id = $1`,
      [msgId]
    );
    const message = row.rows;

    res.render("updateMsg", {
      title: "Update Message",
      message: message,
    });
  } catch (error) {
    console.error("Error getting message:", error);
    throw new Error("Failed to retrieve message");
  }
}

const postMessageUpdate = [
  validateMsg,
  async (req, res) => {
    try {
      const msgId = req.params.id;
      const title = req.body.title;
      const msg = req.body.msg;
      await pool.query(
        "UPDATE messages SET title = $1, text = $2 WHERE messages_id = $3 ",
        [title, msg, msgId]
      );
      res.redirect("/message-board");
    } catch (error) {
      console.error("Error getting message:", error);
      throw new Error("Failed to retrieve message");
    }
  },
];

module.exports = {
  getMessages,
  getCreateMessage,
  postCreateMessage,
  getMessageUpdate,
  postMessageUpdate,
};
