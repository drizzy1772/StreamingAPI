



async function fetchHealth() {
    const url = "http://127.0.0.1:8080/health";
    try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result);
      
      document.querySelector("#content").innerHTML = `
        <p>Status: ${result.status}</p>
        <p>Redis: ${result.redis}</p>
        <p>Database: ${result.database}</p>
      `
    } catch(error) {
            console.error(error.message)
    }
}

async function register() {
  const url = "http://127.0.0.1:8080/register";

  try {
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const loginResponse = await fetch (url, {
      method: "POST",
      headers: { "Content-type": "application/json"},
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Response status ${loginResponse.status}`);
    }

    const data = await loginResponse.json();
    console.log(data);

    showAlert(`User registered: ${data.message} successfully`, "success");

  } catch(error) {
    console.error(error.message);

    showAlert(error.message, "error");

  }
}

async function login() {
    const resultDiv = document.querySelector("#token-result");
    resultDiv.innerHTML = "";
    resultDiv.classList.remove("text-green-400", "bg-green-900", "text-red-400", "bg-red-900", "p-3", "rounded-lg");

    const url = "http://127.0.0.1:8080/login";

    try {

    const username = document.querySelector("#username").value
    const password = document.querySelector("#password").value

    const loginResponse = await fetch (url, {
        method: "POST",
        headers: { "Content-type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({ username: username, password: password }),
      })

      const data = await loginResponse.json();

      if (!loginResponse.ok) {
          throw new Error(`Error! ${loginResponse.status} - ${JSON.stringify(data)}`);
      }

      const token = data.access_token;

      showAlert(`Token ${token}`, "success");

      
    const resultDiv2 = document.querySelector("#token-result");
    resultDiv2.innerHTML = '';
    resultDiv2.classList.remove("text-green-400", "bg-green-900", "p-3", "rounded-lg");

    localStorage.setItem("token", data.access_token);
    document.getElementById("auth-section").classList.add("hidden");
    

    const user = await getCurrentUser();

    if (!user) {
      return;
    }

    const userIDS = user.user_id;
    const storageKey = `user_${userIDS}_interests`;

    const savedInterests = JSON.parse(localStorage.getItem(storageKey)) || [];

    selectedInterests = savedInterests;

    if (savedInterests.length === 3) {
      document.getElementById("auth-section").classList.add("hidden");
      document.getElementById("interests-section").classList.add("hidden");
      document.getElementById("feed-section").classList.remove("hidden");
      
      fetchDevFeed();

      renderSearchHistory();
    } else {
      document.getElementById("interests-section").classList.remove("hidden");
    }

    } catch(error) {
        console.error(error.message);
        showAlert(error.message, "error")
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  
  const resultAddClass = document.getElementById("feed-section");
  resultAddClass.classList.add("hidden");

  const resultAddInterest = document.getElementById("interests-section");
  resultAddInterest.classList.add("hidden");
  
  const resultAddAuth = document.getElementById("auth-section");
  resultAddAuth.classList.remove("hidden");


  const resultAddNav = document.getElementById("nav_username");
  resultAddNav.textContent = "Loading user...";

  const resultToken = document.getElementById("token-result");
  resultToken.innerHTML = "";

  selectedInterests = [];

}

function copyToken() {
  const code = localStorage.getItem("token");
  navigator.clipboard.writeText(code);
  const btn = document.getElementById("copy-btn");
  btn.textContent = "Copied!";
  setTimeout(() => btn.textContent = "Copy token", 2000);
}


function showAlert(message, type) {
  const resultDiv = document.getElementById("token-result");
  if (type === "success") {
    resultDiv.textContent = message;
    resultDiv.classList.remove("text-red-400", "bg-red-900", "p-3", "rounded-lg");
    resultDiv.classList.add("text-green-400", "bg-green-900", "p-3", "rounded-lg");
  }
  if (type === "error") {
    resultDiv.textContent = message;
    resultDiv.classList.remove("text-green-400", "bg-green-900", "p-3", "rounded-lg");
    resultDiv.classList.add("text-red-400", "bg-red-900", "p-3", "rounded-lg");
  }
}

async function fetchTrending() {
  const url = "http://127.0.0.1:8080/api/v1/trending";
  const getToken = localStorage.getItem("token");

  if (!getToken) {
  console.log("No token, login first");
  return;
}
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getToken}`,
      }
    });

    const data = await response.json();
    console.log(data);

    document.getElementById("content").innerHTML = JSON.stringify(data);
    return data;
    

  } catch (error) {
    console.error("Request failed: ", error.message);

  }
}

async function getCurrentUser() {
  const url = "http://127.0.0.1:8080/api/v1/users/me";
  const getToken = localStorage.getItem("token");
  
  if (!getToken) {
    console.log("No token.");
    return;
}
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getToken}`,
      }
    });
    
    const data2 = await response.json();


    if (!response.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      return;
    }
    

    console.log(data2);
    console.log(data2.user_id);

    localStorage.setItem("user_id", data2.user_id);

    document.getElementById("nav_username").textContent = `Hello, ${data2.username}`;
    return data2


  } catch(error2) {
    console.error("Request failed: ", error2.message);

  }
}

async function fetchFeed() {
  const getUser = localStorage.getItem("user_id");
  const getTokens = localStorage.getItem("token");

  if (!getUser || !getTokens) {
    console.log("User id and token are missing.");
    return;
  }
   
  const url = `http://127.0.0.1:8080/api/v1/feed/${getUser}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getTokens}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Response.status: ${response.status}`);
    }
    const data3 = await response.json();
    console.log(data3);

    const feedCartsContainer = document.getElementById("feed-cards");
    
    feedCartsContainer.innerHTML = "";

    data3.feed.forEach(item => {
      const stats = getRandomStats();
      feedCartsContainer.innerHTML += `
        <div class="bg-black border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-white/20 hover:-translate-y-1 transition-all duration-200">

            <h3 class="text-lg font-medium tracking-tight text-white">${item.title}</h3>
          <div class="flex flex-wrap gap-2">
            ${item.tags.map(tag=> `
              <span class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                    #${tag}
              </span>
              `).join("")}
          </div>

            <div class="flex items-center gap-3 text-xs text-white">
                <span>Views ${stats.views}</span>
                <span class="text-white/10">•</span>
                <span>Likes ${stats.likes}</span>
                <span class="text-white/10">•</span>
                <span>Comments ${stats.comments}</span>
            </div>
            <div class="border-t border-white/10 pt-4">
            <button onclick="trackAction(${item.id})" class="bg-white text-black font-medium py-2 px-4 rounded-lg w-fit hover:bg-gray-200 transition-all duration-200">
              Live Stream
            </button>

        </div>
      `;
    });

  } catch(error) {
    console.error("Error fetching feed: ", error.message);
  }

}

async function createContent() {
  const getTitle = document.getElementById("new-title").value;
  const getTags = document.getElementById("new-tags").value;

  const Token = localStorage.getItem("token");

  if (!Token) {
    console.log("Token was not founded");
    return;
  }

  const url = "http://127.0.0.1:8080/api/v1/contents";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Token}`,
      },
      body: JSON.stringify({
        title: getTitle,
        tags: getTags.split(",").map(tag => tag.trim()),
      })
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("FastAPI Error Details: ", errorDetails);
      throw new Error(`Response status ${response.status}`);
    }

    const result4 = await response.json();
    console.log(result4);

    document.getElementById("new-title").value = "";
    document.getElementById("new-tags").value = "";

    fetchFeed();

  } catch(error) {
    console.error("Error creating post ", error.message);
  }

}

async function trackAction(contentId, eventType = "click") {
  const Token8 = localStorage.getItem("token");
  const getUserId = localStorage.getItem("user_id");

  if (!Token8) {
    console.log("Token was not founded");
    return;
  }

  const url = "http://127.0.0.1:8080/api/v1/analytics/track";

  const payload = {
    content_id: contentId,
    action_type: eventType,
  };

  if (eventType === "comment" && commentText) {
    payload.comment = commentText;
  }

  try {
    const response1 = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Token8}`,
      },
      body: JSON.stringify({
        content_id: contentId,
        user_id: Number(getUserId),
        action_type: eventType,
      })
    });

    if (!response1.ok) {
      const errorDetails = await response1.json();
      console.error("Fastapi analytics Error details: ", errorDetails);
      throw new Error(`Response status: ${response1.status}`);
    }
    const result5 = await response1.json();
    console.log("Tracked successfully:", result5);

    fetchFeed();
  } catch(error) {
    console.error("Error tracking post:", error.message);
  }
}

function startLiveStream(contentId) {
  console.log(`Start live stream for ${contentId}`);

  setInterval(async () => {
    await trackAction(contentId);
  }, 3000);
}

function getRandomStats() {
  return {
    views: Math.floor(Math.random() * 4901) + 100,
    likes: Math.floor(Math.random() * 491) + 10,
    comments: Math.floor(Math.random() * 101),
  };
}




function saveInterests() {
  if (selectedInterests.length != 3) {
    console.log("Choose exactly 3 interests");
    return;
  }

  const userID = localStorage.getItem("user_id");
  
  console.log(userID);

  if (userID) {
    const storageKey = `user_${userID}_interests`;

    localStorage.setItem(storageKey, JSON.stringify(selectedInterests));
  } else {
    console.error("User ID not found in localStorage");
  }

  document.getElementById("feed-section").classList.remove("hidden");
  document.getElementById("interests-section").classList.add("hidden");
  

  getCurrentUser();
  fetchDevFeed();
}

let selectedInterests = [];

document.addEventListener('DOMContentLoaded', async () => {
  const interestButtons = document.querySelectorAll(".interest-btn");
  const token = localStorage.getItem("token");

  let user;
  if (token) {
    user = await getCurrentUser();
  }

  if (user) {
      const userID = user.user_id;
      const storageKey = `user_${userID}_interests`;

      const savedInterests = 
          JSON.parse(localStorage.getItem(storageKey)) || [];

      selectedInterests = savedInterests;


      if (savedInterests.length === 3) {
        document.getElementById("auth-section").classList.add("hidden");
        document.getElementById("feed-section").classList.remove("hidden");
        document.getElementById("interests-section").classList.add("hidden");

        fetchDevFeed();
        renderSearchHistory();
      }
  }
  interestButtons.forEach(button => {

    if (selectedInterests.includes(button.textContent.trim())) {
      button.classList.add(
        "bg-white",
        "text-black",
        "-translate-y-1",
         "shadow-lg"
      );
    }

    button.addEventListener("click", () => {
      const interest = button.textContent.trim();

      if (selectedInterests.includes(interest)) {

        selectedInterests = selectedInterests.filter(item => item !== interest);
        button.classList.remove("bg-white", "text-black", "-translate-y-1", "shadow-lg");
        return;
      }

      if (selectedInterests.length >= 3) return;

      selectedInterests.push(interest);
      button.classList.add("bg-white", "text-black", "-translate-y-1", "shadow-lg");

      console.log(selectedInterests);
      });
    });
  });


async function fetchDevFeed() {
  const userID = localStorage.getItem("user_id");
  const storageKey = `user_${userID}_interests`;
  const interests = JSON.parse(localStorage.getItem(storageKey)) || [];
  const tag = interests[0].toLowerCase();

  const url = `https://dev.to/api/articles?tag=${tag}&per_page=10`;
  const response = await fetch(url);
  const articles = await response.json();

  const feedCartsContainer = document.getElementById("feed-cards");
  feedCartsContainer.innerHTML = "";

  articles.forEach(article => {
    const parsing = JSON.parse(localStorage.getItem("savedArticles")) || [];
    console.log(parsing.includes(article.id));
    
    const isSaved = parsing.includes(article.id);


    feedCartsContainer.innerHTML += `
        <div class="bg-black border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-white/20 hover:-translate-y-1 transition-all duration-200">

            ${article.cover_image ? `<img src="${article.cover_image}" class="w-full h-48 object-cover rounded-xl">` : ''}

            <h3 class="text-lg font-medium text-white">
              ${article.title}
            </h3>
            
            <div class="flex flex-wrap gap-2">
              ${article.tag_list.map(tag => `
                <span class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                  #${tag}
                </span>
                `).join("")}
            </div>

            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>${article.user.name}</span>
              <span>${article.reading_time_minutes} min read</span>
            </div>

            <div class="text-xs text-gray-400">
                ${article.positive_reactions_count} reactions
            </div>
            

            <div class="border-t border-white/10 pt-4 flex justify-start gap-3">
            
              <a
                href="${article.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-white text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition w-fit">
                Click
            </a>

              <button onclick="saveArticle(${article.id}, this)"
              class="${isSaved ? 'bg-yellow-400' : 'bg-white'} text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-all duration-200">
            ${isSaved ? 'Saved': 'Save'}
              </button>

              <button onclick="shareArticle('${article.url}', this)"
              class="bg-white text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-all duration-200 ml-auto">
                Share
              </button>
            </div>
        </div>
    </div>
    `;
  });

}

function saveArticle(articleId, button) {
  let parsing = JSON.parse(localStorage.getItem("savedArticles")) || [];
  if (parsing.includes(articleId)) {
    parsing = parsing.filter(item => item != articleId);

    button.textContent = "Save";
    button.classList.remove("bg-yellow-400");
    button.classList.add("bg-white");
  } else {
    parsing.push(articleId);

    button.textContent = "Saved";
    button.classList.remove("bg-white");
    button.classList.add("bg-yellow-400");

    button.classList.add("scale-110");

    setTimeout(() => {
      button.classList.remove("scale-110")
    }, 150);
  }

  localStorage.setItem("savedArticles", JSON.stringify(parsing));


}

async function showSaved() {
  const getSaved = JSON.parse(localStorage.getItem("savedArticles")) || [];

  console.log(getSaved);

  document.getElementById("feed-section").classList.add("hidden");
  document.getElementById("saved-section").classList.remove("hidden");


  if (getSaved.length === 0) {
    console.log("No saved articles");
    return;
  }

  const savedCards = document.getElementById("saved-cards")
  savedCards.innerHTML = "";
  

  for (const articleId of getSaved) {
    const url = `https://dev.to/api/articles/${articleId}`; 

    const response = await fetch(url);

    const article = await response.json();

    console.log(article);

    console.log(article.tag_list);
    console.log(typeof article.tag_list);
    console.log(Array.isArray(article.tag_list));

    savedCards.innerHTML += `
    <div class="article-card bg-black border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-white/20 hover:-translate-y-1 transition-all duration-200">

        ${article.cover_image ? `
            <img
                src="${article.cover_image}"
                class="w-full h-48 object-cover rounded-xl"
            >
        ` : ''}

        <h3 class="text-lg font-medium text-white">
            ${article.title}
        </h3>

        <div class="flex flex-wrap gap-2">
            ${(Array.isArray(article.tag_list) ? article.tag_list : article.tag_list.split(","))
              .map(tag => `
              <span class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                #${tag.trim()}
              </span>`
                ).join("")}
        </div>

        <div class="flex items-center justify-between text-xs text-gray-400">
            <span>${article.user.name}</span>
            <span>${article.reading_time_minutes} min read</span>
        </div>

        <div class="border-t border-white/10 pt-4 flex justify-start gap-3">

            <a
                href="${article.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-white text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition w-fit">
                Click
            </a>


            <button onclick="removeArticle(${article.id}, this)"
            class="bg-red-500 text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-red-700 transition-all duration-200">
              Remove
            </button>

        </div>

    </div>
`;
      
  }
}

function showFeed() {
  document.getElementById("saved-section").classList.add("hidden");
  document.getElementById("feed-section").classList.remove("hidden");
}

function removeArticle(articleId, button) {
  let removeSaved = JSON.parse(localStorage.getItem("savedArticles")) || [];
  removeSaved = removeSaved.filter(item => item !== articleId);

  localStorage.setItem(
    "savedArticles",
    JSON.stringify(removeSaved),
  );

  const card = button.closest(".article-card");
  card.remove();

  const feedSaveButton = Array.from(
    document.querySelectorAll('#feed-cards button[onclick^="saveArticle("]')
  ).find(button => button.getAttribute("onclick").startsWith(`saveArticle(${articleId},`));

  if (feedSaveButton) {
    feedSaveButton.textContent = "Save";
    feedSaveButton.classList.remove("bg-yellow-400");
    feedSaveButton.classList.add("bg-white");
  }

}

async function searchArticles() {
  const query = document.getElementById("search-query").value.toLowerCase();

  if (!query) {
    console.log("Enter a search query");
    return;
  }

  saveSearchHistory(query);

  const tags = query.split(",").map(tag => tag.trim());

  const responses = tags.map(tag => fetch(`https://dev.to/api/articles?tag=${tag}&per_page=10`));

  const responsesResolved = await Promise.all(responses);

  const articlesArrays = await Promise.all(
    responsesResolved.map(r => r.json()));

  const articlesURL = articlesArrays.flat();

  console.log("What happened: ", articlesURL, typeof articlesURL, Array.isArray(articlesURL));
  const feedCartsContainer = document.getElementById("feed-cards");
  feedCartsContainer.innerHTML = "";

  if (articlesURL.length === 0) {
    feedCartsContainer.innerHTML = '<p class="text-gray-400 text-center col-span-2">No articles found for this tag</p>';
    return;
  }



  articlesURL.forEach(article => {
    const parsing = JSON.parse(localStorage.getItem("savedArticles")) || [];
    console.log(parsing.includes(article.id));
    
    const isSaved = parsing.includes(article.id);


    feedCartsContainer.innerHTML += `
        <div class="bg-black border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-white/20 hover:-translate-y-1 transition-all duration-200">

            ${article.cover_image ? `<img src="${article.cover_image}" class="w-full h-48 object-cover rounded-xl">` : ''}

            <h3 class="text-lg font-medium text-white">
              ${article.title}
            </h3>
            
            <div class="flex flex-wrap gap-2">
              ${article.tag_list.map(tag => `
                <span class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                  #${tag}
                </span>
                `).join("")}
            </div>

            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>${article.user.name}</span>
              <span>${article.reading_time_minutes} min read</span>
            </div>

            <div class="text-xs text-gray-400">
                ${article.positive_reactions_count} reactions
            </div>
            

            <div class="border-t border-white/10 pt-4 flex justify-start gap-3">
            
              <a
                href="${article.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-white text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition w-fit">
                Click
            </a>

            <button onclick="saveArticle(${article.id}, this)"
            class="${isSaved ? 'bg-yellow-400' : 'bg-white'} text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-all duration-200">
            ${isSaved ? 'Saved': 'Save'}
            </button>

            <button onclick="shareArticle('${article.url}', this)"
            class="bg-white text-black text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-all duration-200 ml-auto">
              Share
            </button>
        </div>
    </div>
    `;
  });

}

function shareArticle(url, button) {
  navigator.clipboard.writeText(url);

  button.textContent = "Copied!"
  setTimeout(() => button.textContent = "Share", 2000);

}

function saveSearchHistory(query) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  history = history.filter(tag => tag != query);

  history.unshift(query);

  history = history.slice(0, 5);

  localStorage.setItem("searchHistory", JSON.stringify(history));

  renderSearchHistory();

}

function renderSearchHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const container = document.getElementById("search-history");

  container.innerHTML = "";

  history.forEach(tag => {

    container.innerHTML += `
      <button onclick="document.getElementById('search-query').value = '${tag}'; searchArticles()">${tag}</button>

      `;
});

}


function filterByTitle() {
  console.log("filterByTitle called")
  const filterText = document.querySelector("#title-filter").value.toLowerCase();
  console.log("filterText", filterText);

  const cards = document.querySelectorAll("#feed-cards > div");
  console.log("cards found:", cards.length);

  cards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    console.log("card title: ", title);

    if (title.includes(filterText)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  })


}
//fetchHealth();
