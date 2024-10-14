document.addEventListener('alpine:init', () => {
  window.Alpine.data('application', () => ({
    data: null,
    user: null,
    auth: null,
    isRecording: false,
    /** @type {MediaStream} */
    stream: null,
    recordedChunks: [],
    /** @type {MediaRecorder} */
    mediaRecorder: null,
    async startRecording($router) {
      if (this.isRecording) {
        this.mediaRecorder.stop();
        this.stream.getTracks().forEach((track) => track.stop());
        this.isRecording = this.stream.active;
        return;
      }
      try {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        this.isRecording = this.stream.active;
        const blob = await this.streamToBlob(this.stream);
        const data = new FormData();
        data.append('file', blob);
        data.append('group', this.user?.unsafeMetadata?.group_id ?? '');

        const req = await fetch('/api/file', {
          method: 'POST',
          body: data,
        });
        const res = await req.json();

        if (!req.ok) {
          console.error(res);
        }

        const url = `/v/${res.id}`;
        $router.push(url);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    async streamToBlob(stream, mimeType = 'video/webm') {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      return new Promise((resolve, reject) => {
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          this.isRecording = false;
          resolve(blob);
        };

        this.mediaRecorder.onerror = (event) => {
          this.isRecording = false;
          reject(event.error);
        };

        this.mediaRecorder.start();
      });
    },
    async getMedia(id) {
      try {
        const req = await fetch(`/api/file?id=${id}`);
        const res = await req.json();
        if (!req.ok) {
          console.error(res);
        }
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    async updateTitle(id, title) {
      try {
        const req = await fetch(`/api/file`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, title }),
        });
        const res = await req.json();
        if (!req.ok) {
          console.error(error);
        }
        return res;
      } catch (error) {
        console.error(error);
      }
    },
    async deleteMedia(id, $router) {
      if (!this.user?.id) return;
      if (!confirm(`Delete this media recording?`)) {
        return;
      }
      try {
        const req = await fetch(`/api/file`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        if (!req.ok) {
          $router.push(`/`);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getFiles() {
      try {
        const request = await fetch(
          `/api/files?group=${this.user.unsafeMetadata.group_id}`
        );
        const response = await request.json();
        return response.files;
      } catch (error) {
        console.error(error);
      }
    },
  }));
});

async function initAuth() {
  await Clerk.load({
    appearance: {
      elements: {
        formButtonPrimary: `bg-gray-300 normal-case text-base !border-2 border-black shadow-flat py-2 px-4 rounded-lg hover:shadow-none transition-shadow duration-200 text-black hover:bg-gray-300`,
      },
    },
  });

  if (Clerk.user) {
    if (!Clerk.user.unsafeMetadata?.group_id) {
      const request = await fetch('/api/group');
      const response = await request.json();
      Clerk.user.update({ unsafeMetadata: { group_id: response.id } });
    }
  }

  return [Clerk.user, Clerk];
}
