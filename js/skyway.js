
const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;
const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: "1b9fcd6d-0bb5-4b3c-9429-cc3ff64611f8",
        turn: true,
        actions: ["read"],
        channels: [
          {
            id: "*",
            name: "*",
            actions: ["write"],
            members: [
              {
                id: "*",
                name: "*",
                actions: ["write"],
                publication: {
                  actions: ["write"],
                },
                subscription: {
                  actions: ["write"],
                },
              },
            ],
            sfuBots: [
              {
                actions: ["write"],
                forwardings: [
                  {
                    actions: ["write"],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  }).encode("gzGqwBFs16h6BC9EMd7EYbYjah/FEtQo6VAH+qE7Ztg=");

  (async () => {
    const setlocalVideo = document.getElementById('set-local-stream');
    const localVideo = document.getElementById('local-stream');
    const setVideo = document.getElementById('videoImg');
    const displayvideo = document.getElementById('video');
  
    const joinTrigger = document.getElementById('join-trigger');
    const leaveTrigger = document.getElementById('js-leave-trigger');
    const remoteVideos = document.getElementById('remote-stream');
    const stop = document.getElementById('stop');
  
    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();
  
    // Render local stream
    setVideo.addEventListener('click', async () => {
      setlocalVideo.muted = true;
      setlocalVideo.playsInline = true;
      video.attach(setlocalVideo);
      await setlocalVideo.play();
    });

    const context = await SkyWayContext.Create(token, {
      log: { level: 'warn', format: 'object' },
    });
  
    let room;
  
    // Register join handler
    joinTrigger.addEventListener('click', async () => {

      const roomname = $("#chatname").val();
      room = await SkyWayRoom.FindOrCreate(context, {
        type: "sfu",
        name: roomname,
      });

      video.attach(localVideo);
      await localVideo.play();
      displayvideo.style.display = 'block';
      const member = await room.join();
  
      room.onMemberJoined.add((e) => {
      });
  
      const userVideo = {};
  
      member.onPublicationSubscribed.add(async ({ stream, subscription }) => {
        if (stream.contentType === 'data') return;
  
        const publisherId = subscription.publication.publisher.id;
        if (!userVideo[publisherId]) {
          const newVideo = document.createElement('video');
          newVideo.playsInline = true;
          newVideo.autoplay = true;
          newVideo.style.height = "200px";
          newVideo.setAttribute(
            'data-member-id',
            subscription.publication.publisher.id
          );
  
          remoteVideos.append(newVideo);
          userVideo[publisherId] = newVideo;
        }
        const newVideo = userVideo[publisherId];
        stream.attach(newVideo);
  
        if (subscription.contentType === 'video' && room.type === 'sfu') {
          newVideo.onclick = () => {
            if (subscription.preferredEncoding === 'low') {
              subscription.changePreferredEncoding('high');
            } else {
              subscription.changePreferredEncoding('low');
            }
          };
        }
      });
      const subscribe = async (publication) => {
        if (publication.publisher.id === member.id) return;
        await member.subscribe(publication.id);
      };
      room.onStreamPublished.add((e) => subscribe(e.publication));
      room.publications.forEach(subscribe);
  
      await member.publish(audio);
      if (room.type === 'sfu') {
        await member.publish(video, {
          encodings: [
            { maxBitrate: 10_000, id: 'low' },
            { maxBitrate: 800_000, id: 'high' },
          ],
        });
      } else {
        await member.publish(video);
      }
      const disposeVideoElement = (remoteVideo) => {
        const stream = remoteVideo.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      };
  
      room.onMemberLeft.add((e) => {
        if (e.member.id === member.id) return;
  
        const remoteVideo = remoteVideos.querySelector(
          `[data-member-id="${e.member.id}"]`
        );
  
        disposeVideoElement(remoteVideo);
  
      });
  
      member.onLeft.once(() => {
        Array.from(remoteVideos.children).forEach((element) => {
          disposeVideoElement(element);
        });
        localVideo.removeAttribute('src'); // empty source
        localVideo.load();
        room.dispose();
        room = undefined;
        displayvideo.style.display = 'none';
      });
  
      leaveTrigger.addEventListener('click', () => member.leave(), {

        once: true,
      });
    });
  })();