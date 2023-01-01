async function checkIfNicknameIsValid(nick){
    if(nick == ""){
        return{
            isValid: false,
            msg: "Nickname cant be null"
        }
    }

    //can be changed to something like "getUsers" to get only users
    //but this would use a another database
    let messages = await getMessages();
    let isValid=true;
    let msg = "";
    messages.messages.forEach(message =>{
        if(nick == message.user){
            msg = "Nickname is already used";
        }
    })

    return {isValid: isValid,msg: msg}
}

async function getUserInfo() {
     //localStorage is awesome 
    let userId = localStorage.getItem('nickname');
    
    if (!userId) {
        userId = prompt('Hi, Welcome, Whats your nickname?');
        let checkResponse = await checkIfNicknameIsValid(userId);

        //checking if is a nickname invalid
        while(!checkResponse.isValid){
            alert(checkResponse.msg);
            userId = prompt('Try to use another nickname');
            checkResponse = await checkIfNicknameIsValid(userId);
        }
    

        localStorage.setItem('nickname', userId);    
    }

    return userId;
}

async function getMessages(){
    let urlApi = url+"/latest";
    let response = await fetch(urlApi).catch(error=> alert("Cant connect with server, try reload page"));
    let data = await response.json();
  
    return data.record;
}

async function putMessage(user, message){
    let messages = await getMessages();
    messages.messages.push({
        user:user,
        message:message,
    });

    fetch(url, {
        method: 'put',
        body: JSON.stringify(messages),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
    }).then(response => response.json())
    .then(async () => {
        await renderMessages();
        buttonSend.disabled = false;
    })
    .catch(error => {
        alert("Cant send, are you online?");
        buttonSend.disabled = false;
    });

    //avoiding information lost while sending many messages

}

async function renderMessages(){
    let messages = (await getMessages()).messages;
    //clear container and redrawing all messages
    //this need a easy implementation if comparated to others ways
    messagesContainer.innerHTML = "";
    
    messages.forEach(message => {
        /*
        building the message item
        is like
        div message-container -> div message -> span user - div message
        */
        let messageElemment = document.createElement("div");
        let userElement = document.createElement("span");
        let messageDiv = document.createElement("div");
        let messageCont = document.createElement("div");


        userElement.innerHTML = message.user;
        messageDiv.classList.add("message");
        messageElemment.innerHTML = `${message.message}<br>`;

        let classToAdd = "my-message";
        if(userId != message.user){
            messageCont.appendChild(userElement);
            classToAdd="replys-message";
        }
        messageCont.classList.add(classToAdd);
        messageCont.classList.add("message-style");

        messageCont.appendChild(messageElemment);

        messageDiv.appendChild(messageCont);
        messagesContainer.appendChild(messageDiv);
    });
}

let messagesContainer = document.getElementById("messages-container");
let buttonSend = document.getElementById("button-send");
let inputMessage = document.getElementById("input-message");
let userId;

async function main(){
    userId = await getUserInfo();
    await renderMessages();
    //setInterval(await renderMessages, 5000);
    buttonSend.onclick = ()=>{
        if(inputMessage.value!=""){
            buttonSend.disabled = true;
            //replacing "new line" character to new line tag
            putMessage(userId, inputMessage.value.replace(/\r\n|\r|\n/g, "<br>"));
        }
        inputMessage.value = "";
    };
}

let url = "https://api.jsonbin.io/v3/b/63addd4301a72b59f23bdb75";
main();