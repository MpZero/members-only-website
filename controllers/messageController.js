const pool = require("../db/database.js");

async function getMessages(req, res) {
  console.log(req.user);
  const user = req.user;
  try {
    if (user && user.mem_status == true) {
      const rows = await pool.query(
        "SELECT messages_id, title, text, timestamp, username FROM messages JOIN users ON users.users_id = messages.user_id ORDER BY timestamp DESC"
      );
      console.log(rows.rows);

      const messages = rows.rows;
      res.render("messageBoard", { title: "messageBoard", messages });
    } else if (user && user.mem_status == false) {
      const rows = await pool.query(
        "SELECT messages_id, title, text FROM messages ORDER BY messages_id DESC"
      );
      console.log(rows.rows);

      const messages = rows.rows;
      res.render("messageBoard", { title: "messageBoard", messages });
    }
  } catch (error) {
    console.error("Error fetching messages: ", error);
    res.status(500).send("Error fetching messages");
  }
}
const messageBoardGet = (req, res) => {
  res.render("messageBoard");
};

async function getAllMsg() {
  try {
    const { rows } = await pool.query("SELECT * FROM messages");
    return rows;
  } catch (error) {
    console.error("Error getting all messages:", error);
    throw new Error("Failed to retrieve all messages");
  }
}

module.exports = {
  getMessages,
  messageBoardGet,
  getAllMsg,
};
