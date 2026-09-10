# DevPulse — GitHub Developer Dashboard

A responsive web application that transforms public GitHub profiles into a clear and interactive developer dashboard. DevPulse displays profile information, repository statistics, programming-language usage, stars, forks, and top repositories using the public GitHub REST API.

## Live Demo

**[Open DevPulse](https://talhabytes.github.io/devpulse/)**

## GitHub Repository

**[View Source Code](https://github.com/TalhaBytes/devpulse)**

## Features

- Search any public GitHub username with support for an optional `@` prefix.
- Display profile avatar, name, username, bio, location, join date, followers, following, and public repository count.
- Show the six top repositories ranked by stars, with forks and repository name used as tie-breakers.
- Display repository descriptions, primary languages, stars, forks, and archived/fork status.
- Calculate total stars and forks across loaded repositories.
- Generate a proportional programming-language distribution with percentages.
- Support dark and light themes with saved theme preference.
- Provide responsive layouts for desktop, tablet, and mobile devices.
- Include keyboard navigation, visible focus states, skip links, live announcements, and reduced-motion support.
- Display loading skeletons and informative empty states.
- Handle invalid usernames, missing users, network failures, API timeouts, and GitHub rate limits.
- Abort superseded searches when a new username is entered.
- Cache recently loaded profiles for five minutes to reduce unnecessary API requests.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Structure | Semantic HTML5 |
| Styling | CSS Custom Properties, Grid, Flexbox, Media Queries |
| Interaction | Vanilla JavaScript |
| API Communication | Fetch API, AbortController |
| Data | GitHub REST API |
| Preferences | LocalStorage |
| Hosting | GitHub Pages |
| Version Control | Git & GitHub |

DevPulse does not require React, Node.js, a database, package installation, API keys, or a build process. The entire application runs directly in the browser.

## Project Structure

```text
devpulse/
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
├── assets/
│   ├── favicon.svg
│   └── screenshots/
│       ├── desktop-dark.png
│       ├── desktop-light.png
│       └── mobile.png
│
├── .gitignore
├── .nojekyll
├── LICENSE
├── README.md
└── VERIFICATION.md
```

## Local Setup

### 1. Clone the repository

```sh
git clone https://github.com/TalhaBytes/devpulse.git
```

### 2. Open the project directory

```sh
cd devpulse
```

### 3. Start a local server

Using Python:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

On Windows, you can also use:

```sh
py -m http.server 8000 --bind 127.0.0.1
```

### 4. Open DevPulse

Visit:

```text
http://localhost:8000
```

### 5. Stop the server

Press:

```text
Ctrl + C
```

You can also use a VS Code development server if preferred.

An internet connection is required because DevPulse retrieves public profile and repository information directly from GitHub.

## Usage

Enter a GitHub username such as:

```text
octocat
```

Then select **Explore Profile** or press **Enter**.

DevPulse retrieves the user's public GitHub information and displays:

- Developer profile information
- Followers and following
- Public repositories
- Total stars received
- Total repository forks
- Programming-language distribution
- Top repositories
- Repository links

The theme button in the header can be used to switch between dark and light modes.

## Screenshots

### Desktop — Dark Mode

![DevPulse Desktop Dark Mode](assets/screenshots/desktop-dark.png)

### Desktop — Light Mode

![DevPulse Desktop Light Mode](assets/screenshots/desktop-light.png)

### Mobile View

![DevPulse Mobile View](assets/screenshots/mobile.png)

## GitHub API

DevPulse uses the public GitHub REST API.

Profile information is retrieved using:

```text
GET /users/{username}
```

Repository information is retrieved using:

```text
GET /users/{username}/repos
```

Repository pages are loaded sequentially using GitHub pagination metadata.

The application currently supports loading up to:

```text
1,000 repositories
```

for a profile.

## Data Definitions and Limitations

- Repository statistics cover public repositories owned by the selected GitHub user.
- Private repositories are not accessible through the unauthenticated public API.
- Contributions to repositories owned by other users or organizations are not included in repository totals.
- Stars represent stars received by the user's loaded repositories.
- Language percentages are calculated using each repository's primary language.
- Language percentages represent repository distribution rather than source-code volume.
- Archived repositories and forks may still contribute to displayed repository statistics.
- GitHub profile and repository information may change between searches.

## API Rate Limits

DevPulse uses GitHub's API without authentication.

GitHub normally permits a limited number of unauthenticated API requests per originating IP address.

If the limit is reached, DevPulse displays an informative rate-limit message and uses GitHub's reset information when available.

Recent successful searches are cached temporarily in the current browser tab to reduce unnecessary API requests.

For additional information, see:

[GitHub REST API Rate Limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)

## Error Handling

DevPulse includes handling for:

- Invalid usernames
- Empty search input
- Users that do not exist
- Network failures
- Request timeouts
- GitHub API rate limits
- Repository-loading failures
- Searches replaced by newer searches

Each request has a timeout to prevent the interface from waiting indefinitely.

## Security and Privacy

DevPulse does not collect GitHub credentials.

All requests are made directly from the user's browser to GitHub's public REST API.

Profile and repository content is inserted into the application as text rather than interpreted as HTML.

No personal application database or backend server is used.

DevPulse is an independent project and is not affiliated with GitHub.

## Accessibility

The interface includes several accessibility-focused features:

- Semantic HTML
- Keyboard navigation
- Visible keyboard focus
- Skip navigation link
- Accessible status announcements
- Responsive layouts
- Reduced-motion support
- Dark and light themes
- Support for browser zoom

## Responsive Design

DevPulse is designed to work across:

- Desktop computers
- Laptops
- Tablets
- Mobile phones

The interface automatically reorganizes its layout for smaller screen sizes.

## Deployment

DevPulse is deployed publicly using **GitHub Pages**.

Live website:

**https://talhabytes.github.io/devpulse/**

The site is deployed directly from:

```text
main
```

using the repository root:

```text
/(root)
```

Because DevPulse is a static web application, no server-side deployment or build process is required.

Updates pushed to the `main` branch can be automatically published through GitHub Pages.

## Verification

The project has been tested for:

- GitHub profile searching
- Profile information retrieval
- Repository retrieval
- Repository ranking
- Stars and fork totals
- Programming-language calculations
- Missing-user handling
- Invalid-input handling
- Network-error handling
- GitHub rate-limit handling
- Theme persistence
- Keyboard accessibility
- Desktop responsiveness
- Mobile responsiveness

Additional testing information is available in:

[VERIFICATION.md](VERIFICATION.md)

## Future Improvements

Possible future enhancements include:

- GitHub authentication for higher API request limits
- Contribution statistics
- Commit activity visualization
- Repository activity charts
- Organization information
- Repository filtering and sorting
- Search history
- Profile comparison
- Shareable developer reports
- Additional GitHub analytics

## Author

**Muhammad Talha Khan**

Computer Science student and developer.

GitHub: [TalhaBytes](https://github.com/TalhaBytes)

## License

This project is released under the [MIT License](LICENSE).