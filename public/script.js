const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myvideogrid = document.getElementById('self')
const chat = document.getElementById('chat-box')
const messages=document.getElementById('messages')
let mystream;
const myPeer = new Peer()
const myVideo = document.createElement('video') 
myVideo.muted = true
const peers = {}

myPeer.on('open', id => {
  console.log(id)
  socket.emit('join-room', ROOM_ID, id)
  getmedia()  
})

const onactive = () => {
  socket.emit('gotpermission')
}
const getmedia = function () {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  
  }).then(stream => {

    onactive()
    if (stream.getVideoTracks().length == 0) {
       document.getElementById("svideo").innerHTML = "No Video source";
    }
    if (stream.getAudioTracks().length == 0) {
       document.getElementById("mute").innerHTML = "No audio source";
    }
    addVideoStreammine(myVideo, stream)
    mystream = stream
    myPeer.on('call', call => {
      console.log("request id: ", myPeer.id)
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
      call.on('close', () => {
        video.remove()
      })
      
    
    })
   socket.on('user-connected', userId => {
      console.log("User Connected " + userId)
      connectToNewUser(userId, stream)
    })
    socket.on('message', (mes) => {
      shower(mes)
    })
    socket.on('share-screen', (screenid, userId) => {
      const cal = myPeer.call(screenid, stream)
      v = document.createElement('video')
      cal.on('stream', (s) => {
        addVideoStream(v, s)
      })
      cal.on('close', () => {
        v.remove()
      })
    })

  })
}


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})




function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
function addVideoStreammine(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  myvideogrid.append(video)
}
function copier()
{ navigator.clipboard.writeText(window.location.href);
  document.getElementById("button").innerHTML = "Link Copied!";
  setTimeout( function() {
      document.getElementById("button").innerHTML = "Link";
                         }, 1500);}
function timer()
{
  const timevar = document.getElementById('timer');
  let time = 0;
       setInterval(()=>{
       timevar.innerText="Active Time: " + String(time) + " Seconds"
       time++
     },1000)}
 
const playstop = () => {
  if (mystream.getVideoTracks().length > 0) {
  
    let enabled = mystream.getVideoTracks()[0].enabled;
    if (enabled) {
      mystream.getVideoTracks()[0].enabled = false;
      document.getElementById("svideo").innerHTML = "Show Video";
      
    } else {
      mystream.getVideoTracks()[0].enabled = true;
      document.getElementById("svideo").innerHTML = "Hide Video";
    }
  } else {
     document.getElementById("svideo").innerHTML = "No Video source";
  }
    };
    
const muteunmute = () => {
  if (mystream.getAudioTracks().length > 0) {
    
    const enabled = mystream.getAudioTracks()[0].enabled;
    if (enabled) {
        
      mystream.getAudioTracks()[0].enabled = false;
      document.getElementById("mute").innerHTML = "Unmute";

    } else {
        
      mystream.getAudioTracks()[0].enabled = true;
      document.getElementById("mute").innerHTML = "Mute";
       
    }
  } else {
     document.getElementById("mute").innerHTML = "No audio source";
  }
    };


const message = () => {
  div=document.createElement('div')
  div.innerHTML = chat.value;
  div.className = "message"
  div.setAttribute('align', 'right')
  messages.appendChild(div)
 socket.emit('message',chat.value)
}
const shower = (mes) => {
  div=document.createElement('div')
  div.innerHTML = mes;
  div.className = "message"
  div.setAttribute('align','left')
  messages.appendChild(div)

}
var display_remove = 0;
let nPeer;
let screenshare

const displayscreen = () => {
  if (display_remove == 0) {
    display_remove = 1
    nPeer = new Peer()
    
    navigator.mediaDevices.getDisplayMedia(
      {
        video: true,
        audio: true
      }
    ).then((stream) => {
      screenshare=stream
      socket.emit('share-screen', nPeer.id)
      nPeer.on('call', (call) => {
        
        call.answer(stream)
      })

      document.getElementById('share_screen').innerHTML = ('Stop sharing screen')
      stream.oninactive = function () {

        console.log('ended')
        document.getElementById('share_screen').innerHTML = ('share screen')
        nPeer.destroy()
        display_remove=0
  };


    })
  } else {
  
    display_remove = 0
    document.getElementById('share_screen').innerHTML = ('share screen')
    let all_tracks=screenshare.getTracks()
    all_tracks.forEach(track => track.stop());
 
   
  }

}