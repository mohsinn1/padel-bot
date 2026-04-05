# padel-bot

A WhatsApp bot designed to monitor a specific group and track scores between predefined teams. It leverages Baileys for seamless WhatsApp integration, providing real-time score updates and persistent storage for game results.

## ✨ Key Features

*   **WhatsApp Group Monitoring**: Actively listens and processes messages within a designated WhatsApp group.
*   **Persistent Score Tracking**: Keeps track of scores for multiple teams, saving them to a local JSON file to ensure data is not lost on restart.
*   **Dynamic Team Management**: Easily configure and update team names and initial scores directly within the scores.json file.
*   **Real-time Updates**: Provides instant score updates and displays them within the monitored WhatsApp group.
*   **Easy Setup**: Simple installation process with a QR code for WhatsApp account linking.

## 🚀 Technologies Used

### Languages

*   JavaScript (Primary development language)

### Tools & Frameworks

*   **Node.js**: The JavaScript runtime environment.
*   **Baileys (`@whiskeysockets/baileys`)**: For WhatsApp web client implementation.
*   **QR Code Terminal**: To display the QR code for WhatsApp account linking.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 16.x or higher is recommended. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm** or **yarn**: Node.js package managers, usually bundled with Node.js.

## 📦 Installation & Setup

Follow these steps to get `padel-bot` up and running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mohsinn1/padel-bot.git
    cd padel-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Initialize scores file (if not present):**
    The bot will automatically create a `scores.json` file with default teams if it doesn't exist. You can modify this file to set up your desired teams and initial scores.

    **`scores.json` example:**
    ```json
    {
      "Team A": 0,
      "Team B": 0,
    }
    ```

4.  **Start the bot:**
    ```bash
    node index.js
    ```

5.  **Link your WhatsApp account:**
    Upon running `index.js`, a QR code will be displayed in your terminal. Scan this QR code using your WhatsApp app (Go to `Settings > Linked Devices > Link a Device`) to connect the bot to your account.

    The bot will then connect and start monitoring the configured group.

## 💡 Usage

Once the bot is connected and running, it will automatically monitor the WhatsApp group specified by `TARGET_GROUP_NAME`. The specific commands to interact with the bot (e.g., to update scores, display current scores, reset scores) are implemented within the `connectToWhatsApp` function in `index.js`.

The bot primarily interacts with the `scores.json` file. For instance, if your `scores.json` looks like this:

```json
{
  "Team A": 0,
  "Team B": 0
}
```

The bot will manage scores for these two teams in the designated group ("PEDAL SHYT" by default). You'll interact with it directly through messages in the `TARGET_GROUP_NAME` group according to its internal logic.

## 🛠️ Configuration

You can customize the bot's behavior by modifying the following constants in `index.js`:

*   **`TARGET_GROUP_NAME`**: The exact name of the WhatsApp group the bot should monitor.
    ```javascript
    const TARGET_GROUP_NAME = "PEDAL TEST"; // Change this to your group's exact name
    ```
*   **`SCORES_FILE`**: The path to the JSON file where scores are stored.
    ```javascript
    const SCORES_FILE = "./scores.json"; // Change if you want to store scores elsewhere
    ```
*   **Initial Scores**: The initial state of `scores.json` is automatically created if it doesn't exist. You can manually edit `scores.json` to add or remove teams, or to set initial scores before running the bot.

