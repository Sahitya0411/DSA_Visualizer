# DSA-Visualizer 🚀
An interactive web application to visualize Data Structures and Algorithms (DSA) concepts, including pathfinding and sorting algorithms, using p5.js. Perfect for students, educators, and enthusiasts looking to explore algorithms in a visual and engaging way! 🎨

## ✨ Features

### Pathfinding Visualizer
- **Algorithms**: Dijkstra, A*, Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First Search.
- **Interactive Grid**: Set start/target nodes, draw walls, and generate mazes (Recursive Division, Basic Random Maze, Simple Stair Pattern).
- **Visual Feedback**: Color-coded nodes for start (blue), target (purple), walls (dark gray), unvisited (light gray), visited (cyan-to-purple gradient), and shortest path (yellow).
- **Controls**: Adjustable animation speed, clear board/walls/path, stop visualization.
- **Keyboard Shortcuts**: `S` (start), `T` (target), `W` (walls).

### Sorting Visualizer
- **Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort.
- **Dynamic Visualization**: Array bars with colors for comparing (cyan), swapping/placing (purple), and sorted elements (yellow).
- **Customizable**: Array sizes (20, 50, 100 elements), adjustable animation speed.
- **Controls**: Start sorting, stop, reset array.

### General
- **Responsive Design**: Adapts to mobile and desktop screens with dynamic canvas resizing.
- **User-Friendly UI**: Intuitive dropdowns, buttons, and interactive legend.
- **No Dependencies**: Uses p5.js via CDN for easy setup.

## 🛠️ Technologies
- **HTML5**: Application structure.
- **CSS3**: Dark theme, responsive layout, and smooth animations.
- **JavaScript**: Algorithm logic and interactivity.
- **p5.js (v1.4.2)**: Canvas rendering for visualizations.

## 📦 Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/dsa-visualizer.git
   cd dsa-visualizer


Open in Browser:open index.html directly


📂 Project Structure
dsa-visualizer/

├── index.html      # Main HTML file

├── styles.css      # CSS styling

├── script.js       # JavaScript logic and p5.js sketches

└── README.md       # Documentation

## 🎮 Usage

## Pathfinding Visualizer

Select Pathfinding Visualizer from the top dropdown.
Set Nodes:
Click Set Start/S or Set Target/T to place nodes.
Click Set Walls/W to draw walls (click or drag).


Choose Algorithm: Pick from Dijkstra, A*, BFS, DFS, or Greedy.
Generate Maze: Select Recursive Division, Random Maze, or Stair Pattern.
Visualize: Click Visualize! to run the algorithm. Use Stop to halt.
Clear Options: Clear board, walls, or path as needed.
Speed: Adjust animation speed (Very Fast, Fast, Normal, Slow).


## Sorting Visualizer

Select Sorting Visualizer from the top dropdown.
Choose Algorithm: Pick Bubble, Selection, Insertion, Merge, or Quick Sort.
Set Array Size: Choose 20, 50, or 100 elements.
Sort: Click Sort! to start. Use Stop to pause.
Reset: Click Reset Array for a new random array.
Speed: Adjust animation speed.

Example

Pathfinding: Place start at (2,2), target at (cols-5, rows-5), add walls, and run A* to see the shortest path in yellow.
Sorting: Use Merge Sort with 50 elements to watch the bars sort with animated comparisons and swaps.

## 🐛 Known Issues

Performance: A* and Dijkstra use array sorting for priority queues, which may lag on large grids.
Unreachable Targets: No user feedback when the target is blocked by walls.
Mobile: Controls may require scrolling on very small screens.

## 🚀 Future Enhancements

Implement a priority queue (min-heap) for A* and Dijkstra.
Add diagonal movement for pathfinding.
Include more algorithms (e.g., Heap Sort, Radix Sort).
Provide feedback for invalid configurations.
Add pause/resume functionality.

## 🤝 Contributing
We welcome contributions! To get started:

Fork the repository.
Create a branch: git checkout -b feature/your-feature.
Commit changes: git commit -m "Add your feature".
Push to the branch: git push origin feature/your-feature.
Open a pull request with a detailed description.

Please follow the Code of Conduct and report issues via GitHub Issues.

## 🙌 Acknowledgments
p5.js for canvas rendering.
Inspired by tools like Pathfinding Visualizer.
Built with ❤️ for the DSA learning community.


Author: Sahitya
