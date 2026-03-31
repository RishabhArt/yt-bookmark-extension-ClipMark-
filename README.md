# 📺 ClipMark - YouTube Bookmark Extension

A powerful Chrome extension that lets you save and manage timestamps in YouTube videos, making it easy to revisit important moments.

## ✨ Features

- **⏱ Timestamp Bookmarking**: Save any moment in a YouTube video with a single click
- **📝 Editable Descriptions**: Customize bookmark titles with inline editing
- **🔍 Search Functionality**: Quickly find bookmarks using the search feature
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📤 Export Bookmarks**: Export your bookmarks for backup or sharing
- **🎯 One-Click Navigation**: Jump directly to any bookmarked timestamp
- **💾 Persistent Storage**: Bookmarks are saved locally and sync across devices
- **🎨 Clean UI**: Modern, intuitive interface with smooth animations

## 🚀 Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/yt-bookmark-extension-ClipMark.git
   cd yt-bookmark-extension-ClipMark
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension folder

5. The ClipMark icon will appear in your Chrome toolbar

## 📖 Usage

### Creating Bookmarks
1. Play any YouTube video
2. Navigate to the timestamp you want to save
3. Click the bookmark icon (📖) that appears in the YouTube player controls
4. Your bookmark is automatically saved with the current timestamp

### Managing Bookmarks
1. Click the ClipMark extension icon in your Chrome toolbar
2. View all bookmarks for the current video
3. **Edit titles**: Click on any bookmark title to edit it inline
4. **Play bookmark**: Click the play button (▶️) to jump to that timestamp
5. **Delete bookmark**: Click the delete button (🗑️) to remove it

### Additional Features
- **Search**: Use the search bar to filter bookmarks by title
- **Export**: Click the Export button to download bookmarks as JSON
- **Dark Mode**: Toggle between light and dark themes with the Dark button

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Built with the latest Chrome extension standards
- **Content Script**: Injects bookmark functionality into YouTube pages
- **Background Service**: Handles extension lifecycle and storage
- **Popup Interface**: Manages bookmark display and operations

### File Structure
```
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── contentScript.js       # YouTube page integration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── utils.js              # Utility functions
└── assets/               # Icons and images
    ├── bookmark.png
    ├── play.png
    ├── delete.png
    ├── save.png
    └── ext-icon.png
```

### Permissions
- `storage`: For saving bookmarks locally
- `tabs`: For accessing current YouTube video information
- `host_permissions`: Limited to YouTube domains only

## 🛠 Development

### Prerequisites
- Chrome browser
- Basic knowledge of JavaScript, HTML, and CSS

### Setup
1. Fork and clone the repository
2. Make your changes to the source files
3. Load the extension in Chrome using the installation steps
4. Test your changes on YouTube videos

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 🐛 Troubleshooting

### Extension Not Working
- Ensure Developer Mode is enabled in `chrome://extensions/`
- Check that the extension is properly loaded
- Refresh the YouTube page after installing

### Bookmarks Not Saving
- Check Chrome storage permissions
- Ensure you're on a valid YouTube video page
- Try reloading the extension

### UI Issues
- Clear extension cache and reload
- Check for conflicts with other YouTube extensions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- YouTube for providing the platform
- Chrome Extension Documentation
- All contributors and users of ClipMark

## 📞 Support

If you encounter any issues or have feature requests, please:
1. Check existing [Issues](https://github.com/yourusername/yt-bookmark-extension-ClipMark/issues)
2. Create a new issue with detailed description
3. Include screenshots if applicable

---

**Made with ❤️ for YouTube enthusiasts**
