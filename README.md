# TubeStalk

TubeStalk is a browser extension that enhances your YouTube viewing experience by automatically pausing videos when you look away and resuming them when you return your gaze. This ensures you never miss a moment of your favorite content.

## Features

- **Automatic Video Control**: Uses face detection to pause and play YouTube videos based on your attention.
- **Seamless Integration**: Works on all YouTube pages without any additional setup.
- **User-Friendly Interface**: Simple enable/disable controls accessible via a popup menu.
- **Privacy-Focused**: Processes video data locally without sending it to external servers.

## How It Works

TubeStalk leverages advanced face detection models to determine when you are looking at the screen. The extension uses a combination of face landmark detection and recognition to ensure accurate and reliable performance.

### Technologies Used

- **face-api.js**: A JavaScript library for face detection and recognition, providing the core functionality for detecting when a user is looking at the screen.
- **JavaScript**: The primary programming language used for developing the extension.
- **HTML/CSS**: Used for creating the user interface of the extension.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gohar-wahidy/TubeStalk.git
   ```

2. Open your browser's extension page (usually found in the settings menu).

3. Enable "Developer mode" (usually a toggle in the top right corner).

4. Click "Load unpacked" and select the cloned `TubeStalk` directory.

5. Grant camera access when prompted to enable face detection.

## Usage

- Click on the TubeStalk icon in your browser's toolbar to open the popup.
- Use the "Enable" button to start the face detection and video control.
- Use the "Disable" button to stop the face detection.

## Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, feel free to open a pull request or issue.

## Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for the face detection models.

## Contact

For questions or support, please open an issue on the GitHub repository or contact me at [goharwah786@gmail.com].
