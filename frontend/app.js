



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
    document.getElementById("feed-section").classList.remove("hidden");
    
    getCurrentUser();
    fetchFeed();

    } catch(error) {
        console.error(error.message);
        showAlert(error.message, "error")
  }
}

function logout() {

  localStorage.removeItem("token");
  
  const resultAddClass = document.getElementById("feed-section");
  resultAddClass.classList.add("hidden");

  const resultAddAuth = document.getElementById("auth-section");
  resultAddAuth.classList.remove("hidden");

  const resultAddNav = document.getElementById("nav_username");
  resultAddNav.textContent = "Loading user...";

  const resultToken = document.getElementById("token-result");
  resultToken.innerHTML = "";

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
    console.log(data2);

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
                    ${tag}
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

//fetchHealth();
