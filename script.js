const accessKey = "";

// DOM Elements
const formEl = document.getElementById("movieForm");
const inputEl = document.getElementById("movieName");
const dropdownEl = document.getElementById("dropdown");
const movieListsEl = document.getElementById("movieLists");
const movieDetailsContainer = document.getElementById("movieDetailsContainer");
const submitBtn = document.getElementById("submitBtn");

let myMovieScores = JSON.parse(localStorage.getItem("myMovieScores")) || []; // Load from localStorage
let debounceTimer;
let selectedMovie;
let reviewText = "";
let ratingValue = "";
let isEditMode = false; // Flag to track edit mode
let editIndex = null; // Index of the movie being edited

// Initially hide input fields
movieDetailsContainer.style.display = "none";
submitBtn.style.display = "none";

// Load saved movies when the page loads
window.addEventListener("load", loadMovies);

// Listen for user input with debounce
inputEl.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = inputEl.value.trim();

    if (query.length > 0) {
      dropdownEl.classList.remove("hidden");
      fetchMovies(query, "s");
    } else {
      dropdownEl.classList.add("hidden");
      dropdownEl.innerHTML = ""; // Clear results
      movieDetailsContainer.style.display = "none";
      submitBtn.style.display = "none";
    }
  }, 1000);
});

// Form submission (Adding a movie)
formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!selectedMovie) {
    alert("Please select a movie from the search results.");
    return;
  }

  if (!reviewText || !ratingValue) {
    alert("Please enter a review and rating before submitting.");
    return;
  }

  // Checks if movie already exist in array
  const matchID = myMovieScores.find(
    (element) => element.imdbID === selectedMovie.imdbID
  );

  console.log(matchID);

  if (matchID) {
    alert("This movie is already on your list");
    return;
  }

  // Add a new movie
  myMovieScores.push({
    poster: selectedMovie.Poster,
    title: selectedMovie.Title,
    year: selectedMovie.Year,
    director: selectedMovie.Director,
    imdbID: selectedMovie.imdbID,
    review: reviewText,
    rating: ratingValue,
  });

  saveMovies(); // Save to localStorage
  renderMovieList(); // Re-render the list

  // Reset form and hide details
  movieDetailsContainer.style.display = "none";
  submitBtn.style.display = "none";
  inputEl.value = "";
  selectedMovie = null;
  reviewText = "";
  ratingValue = "";
});

// Render the movie list
function renderMovieList() {
  movieListsEl.innerHTML = ""; // Clear the list

  myMovieScores.forEach((movie, index) => {
    const li = document.createElement("li");
    li.classList.add("movie-list-item");

    li.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
      <div class="movie-styling">
        <h3>${movie.title} (${movie.year})</h3>
        <p><strong>Director:</strong> ${movie.director}</p>
        <p><strong>Review:</strong> <span class="review-text">${movie.review}</span></p>
        <p><strong>Rating:</strong> <span class="rating-text">${movie.rating}</span>/10</p>
        <button class="edit-btn" data-index="${index}"><i class='bx bxs-pencil'></i></button>
        <button class="delete-btn" data-index="${index}"><i class='bx bxs-trash' ></i></button>
      </div>
    `;

    movieListsEl.appendChild(li);
  });

  // Add event listeners for edit and delete buttons
  addEditDeleteListeners();
}

// Add event listeners for edit and delete buttons
function addEditDeleteListeners() {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      editMovie(index);
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      deleteMovie(index);
    });
  });
}

// Edit a movie
function editMovie(index) {
  const movie = myMovieScores[index];

  // Get all list items
  const listItems = document.querySelectorAll(".movie-list-item");

  // Check if the index is valid
  if (index < 0 || index >= listItems.length) {
    console.error("Invalid index:", index);
    return;
  }

  const listItem = listItems[index]; // Get the specific list item

  // Replace the content of the list item with the edit form
  listItem.innerHTML = `
    <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
    <div class="movie-styling">
      <h3>${movie.title} (${movie.year})</h3>
      <p><strong>Director:</strong> ${movie.director}</p>     
      <textarea id="editReview" placeholder="Write your review here">${movie.review}</textarea>    
      <input type="number" id="editRating" min="1" max="10" value="${movie.rating}">
      <button class="save-btn" data-index="${index}"><i class='bx bx-check'></i></button>
      <button class="cancel-btn" data-index="${index}"><i class='bx bx-x'></i></button>
    </div>
  `;

  // Add event listeners for save and cancel buttons
  const saveButton = listItem.querySelector(".save-btn");
  const cancelButton = listItem.querySelector(".cancel-btn");

  saveButton.addEventListener("click", () => {
    const updatedReview = listItem.querySelector("#editReview").value.trim();
    const updatedRating = listItem.querySelector("#editRating").value.trim();

    if (!updatedReview || !updatedRating) {
      alert("Please enter a review and rating before saving.");
      return;
    }

    // Update the movie in the list
    myMovieScores[index] = {
      poster: movie.poster,
      title: movie.title,
      year: movie.year,
      director: movie.director,
      imdbID: movie.imdbID,
      review: updatedReview,
      rating: updatedRating,
    };

    saveMovies(); // Save to localStorage
    renderMovieList(); // Re-render the list
  });

  cancelButton.addEventListener("click", () => {
    renderMovieList(); // Re-render the list to exit edit mode
  });
}

// Delete a movie
function deleteMovie(index) {
  if (confirm("Are you sure you want to delete this movie?")) {
    myMovieScores.splice(index, 1); // Remove the movie from the list
    saveMovies(); // Save to localStorage
    renderMovieList(); // Re-render the list
  }
}

// Save movies to localStorage
function saveMovies() {
  localStorage.setItem("myMovieScores", JSON.stringify(myMovieScores));
}

// Load movies from localStorage
function loadMovies() {
  if (myMovieScores.length > 0) {
    renderMovieList();
  }
}

// Populate dropdown with search results
function populateDropdown(movies) {
  dropdownEl.innerHTML = ""; // Clear previous results

  if (!movies || movies.length === 0) {
    dropdownEl.classList.add("hidden");
    return;
  }

  movies.forEach((movie) => {
    const li = document.createElement("li");
    li.classList.add("dropdown-item");

    // Movie poster
    const img = document.createElement("img");
    img.src =
      movie.Poster !== "N/A" ? movie.Poster : "/img/no_movie_poster.jpg";
    img.alt = movie.Title;
    img.classList.add("movie-poster");

    // Movie title
    const title = document.createElement("span");
    title.textContent = movie.Title;

    li.appendChild(img);
    li.appendChild(title);
    dropdownEl.appendChild(li);

    // Select movie from dropdown
    li.addEventListener("click", async () => {
      try {
        const movieDetails = await fetchMovies(
          encodeURIComponent(movie.Title),
          "t"
        );

        if (!movieDetails || !movieDetails.Title) {
          alert("Movie details could not be loaded.");
          return;
        }

        inputEl.value = movieDetails.Title; // Set input field to exact movie title

        selectedMovie = {
          Poster: movieDetails.Poster || "/img/no_movie_poster.jpg",
          Title: movieDetails.Title || "Unknown",
          Year: movieDetails.Year || "N/A",
          Director: movieDetails.Director || "Unknown",
          imdbID: movieDetails.imdbID,
        };

        console.log("Selected movie:", selectedMovie);

        // Populate movie details div
        movieDetailsContainer.innerHTML = `
          <img src="${
            selectedMovie.Poster !== "N/A"
              ? selectedMovie.Poster
              : "/img/no_movie_poster.jpg"
          }" alt="${selectedMovie.Title}" class="movie-poster">
          <h3>${selectedMovie.Title} (${selectedMovie.Year})</h3>
          <p><strong>Director:</strong> ${selectedMovie.Director}</p>
          <textarea id="movieReview" placeholder="Write your review here"></textarea>
          <label for="movieRating">Rate 1 to 10:</label>
          <input type="number" id="movieRating" min="1" max="10" value="5">
        `;

        // Store references to the review and rating inputs
        const reviewInput = document.querySelector("#movieReview");
        const ratingInput = document.querySelector("#movieRating");

        reviewInput.addEventListener("input", () => {
          reviewText = reviewInput.value.trim();
        });

        ratingInput.addEventListener("input", () => {
          ratingValue = ratingInput.value.trim();
        });

        // Show review & rating input fields
        movieDetailsContainer.style.display = "flex";
        submitBtn.style.display = "flex";

        dropdownEl.classList.add("hidden"); // Hide dropdown after selection
      } catch (error) {
        console.error("Error fetching movie details:", error);
        alert(
          "An error occurred while fetching movie details. Please try again."
        );
      }
    });
  });

  dropdownEl.classList.remove("hidden"); // Show dropdown when there are results
}

// Fetch movies from API
async function fetchMovies(query, queryType) {
  const endpoint = `http://www.omdbapi.com/?apikey=${accessKey}&${queryType}=${query}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();

    if (data.Response === "False") {
      alert(data.Error || "Movie not found. Please try another search.");
      return;
    }

    if (data.Search) {
      populateDropdown(data.Search); // Populate dropdown with search results
    } else if (data.Title) {
      return data; // Return full movie details
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An error occurred while fetching movie data. Please try again.");
  }
}

// Object reference
/* t
obj = {
  Title: "The Terminator",
  Year: "1984",
  Rated: "R",
  Released: "26 Oct 1984",
  Runtime: "107 min",
  Genre: "Action, Adventure, Sci-Fi",
  Director: "James Cameron",
  Writer: "James Cameron, Gale Anne Hurd, William Wisher",
  Actors: "Arnold Schwarzenegger, Linda Hamilton, Michael Biehn",
  Plot: "A cyborg assassin from the future attempts to find and kill a young woman who is destined to give birth to a warrior that will lead a resistance to save humankind from extinction.",
  Language: "English, Spanish",
  Country: "United Kingdom, United States",
  Awards: "8 wins & 7 nominations",
  Poster:
    "https://m.media-amazon.com/images/M/MV5BZmE0YzIxM2QtMGNlMi00MjRmLWE3MWMtOWQzMGVjMmU0YTFmXkEyXkFqcGc@._V1_SX300.jpg",
  Ratings: [
    { Source: "Internet Movie Database", Value: "8.1/10" },
    { Source: "Rotten Tomatoes", Value: "100%" },
    { Source: "Metacritic", Value: "84/100" },
  ],
  Metascore: "84",
  imdbRating: "8.1",
  imdbVotes: "946,171",
  imdbID: "tt0088247",
  Type: "movie",
  DVD: "N/A",
  BoxOffice: "$38,371,200",
  Production: "N/A",
  Website: "N/A",
  Response: "True",
};
*/
