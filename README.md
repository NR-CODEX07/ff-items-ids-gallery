# Free Fire Item Gallery

A modern, responsive web application for browsing Free Fire game items with advanced search and filtering capabilities.

## Features

- **5x4 Grid Layout**: Display 20 items per page in a perfect 5x4 grid
- **Advanced Search**: Search by name, description, ID, type, rarity, and icon
- **Smart Filtering**: Filter by rare type, item type, and collection type
- **Pagination**: Navigate through 852+ pages of items
- **Rarity-Based Colors**: Image backgrounds colored based on item rarity
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Green Theme**: Beautiful dark green color scheme
- **Performance Optimized**: Debounced search and lazy loading

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Lucide React Icons
- Radix UI Components

## Deployment Instructions

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the project**:
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: `free-fire-item-gallery` (or your preferred name)
   - In which directory is your code located? **./** (current directory)

### Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your hosting provider

3. **Configure routing** to serve `index.html` for all routes

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser** and navigate to `http://localhost:5173`

## Project Structure

```
├── public/
│   ├── main.json          # Item data
│   └── index.html         # HTML template
├── src/
│   ├── components/        # Reusable components
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   └── main.jsx          # Application entry point
├── vercel.json           # Vercel deployment configuration
└── package.json          # Project dependencies
```

## Configuration

- **Items per page**: 20 (5x4 grid)
- **Search debounce**: 300ms
- **Image API**: Free Fire Items API
- **Responsive breakpoints**: 1400px, 1200px, 900px, 768px, 480px

## Performance Features

- Debounced search to prevent excessive API calls
- Lazy loading for images
- Pagination to reduce initial load time
- Error handling for robust user experience
- Responsive design for all screen sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

This project is for educational and demonstration purposes.

