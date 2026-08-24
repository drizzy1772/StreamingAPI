



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

    const resultDiv = document.getElementById("token-result")
    resultDiv.textContent = `Successful: ${JSON.stringify(data)}`;

  } catch(error) {
    console.error(error.message);

    const resultDiv = document.getElementById("token-result");
    resultDiv.textContent = error.message;

  }
}

async function login() {
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
      console.log(data.access_token);

      localStorage.setItem("token", data.access_token);

      const resultDiv = document.getElementById("token-result")

      resultDiv.textContent = `Token: ${token}`;
    } catch(error) {
        console.error(error.message);

        const resultDiv = document.getElementById("token-result");
        resultDiv.textContent = error.message;
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
fetchHealth();
