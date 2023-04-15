import axios from "axios";

document.getElementById("switch-theme")?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    if (currentTheme) {
        const afterTheme = currentTheme == 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute("data-theme", afterTheme);
    }
})

interface returnData {
    code: number,
    message: string,
    data: any
}

document.getElementById("send-challenge")?.addEventListener('click', () => {
    const url = (document.getElementById("webhook-url") as HTMLInputElement).value;
    const verifyToken = (document.getElementById("verify-token") as HTMLInputElement).value;
    const encryptKey = (document.getElementById("encrypt-key") as HTMLInputElement).value;
    const iv = (document.getElementById("iv") as HTMLInputElement).value;
    const challengeContent = (document.getElementById("challenge-content") as HTMLInputElement).value;

    if (url && encryptKey && iv && challengeContent) {
        const challengeButton = document.getElementById("send-challenge");
        const progressBar = document.getElementById("progress-bar");
        const outputsField = document.getElementById('outputs');
        var progress = 0;
        function growProgressBar() {
            progress++;
            if (progress <= 95) {
                progressBar?.setAttribute('value', progress.toString());
            }
            if (finished) {
                progressBar?.setAttribute('value', '100');
                return;
            }
            setTimeout(() => { growProgressBar() }, 150);
        }
        if (challengeButton && progressBar && outputsField) {
            challengeButton.setAttribute('aria-busy', 'true');
            challengeButton.textContent = "Sending request...";
            var finished = false;
            growProgressBar();
            axios.post('/api/send', {
                url, verifyToken, encryptKey, iv, challengeContent
            }).then((res) => {
                finished = true;
                challengeButton.setAttribute('aria-busy', 'false');
                const data: returnData = res.data;
                progressBar.setAttribute('value', '100');
                outputsField.textContent = JSON.stringify(data, null, 4);
                if (data.code == 200) {
                    if (data.data.challenge == challengeContent) {
                        challengeButton.textContent = `POST ${url} 200 OK challenge success`;
                        challengeButton.classList.remove('secondary')
                    } else {
                        challengeButton.textContent = `POST ${url} 200 OK challenge dismatch`;
                        challengeButton.classList.add('secondary')
                    }
                } else {
                    challengeButton.textContent = `POST ${url} ${data.message}`;
                    challengeButton.classList.add('secondary')
                }
            })
        }
    }
})

Array.from(document.getElementsByTagName('input')).forEach(element => {
    element.addEventListener('keyup', () => { saveValue() });
});


function saveValue() {
    const url = (document.getElementById("webhook-url") as HTMLInputElement).value;
    const verifyToken = (document.getElementById("verify-token") as HTMLInputElement).value;
    const encryptKey = (document.getElementById("encrypt-key") as HTMLInputElement).value;
    const iv = (document.getElementById("iv") as HTMLInputElement).value;
    const challengeContent = (document.getElementById("challenge-content") as HTMLInputElement).value;

    localStorage.setItem("inputs", JSON.stringify({ url, verifyToken, encryptKey, iv, challengeContent }));
}

(() => {
    let rawInputs;
    if (rawInputs = localStorage.getItem("inputs")) {
        let inputs = JSON.parse(rawInputs);
        (document.getElementById("webhook-url") as HTMLInputElement).value = inputs.url;
        (document.getElementById("verify-token") as HTMLInputElement).value = inputs.verifyToken;
        (document.getElementById("encrypt-key") as HTMLInputElement).value = inputs.encryptKey;
        (document.getElementById("iv") as HTMLInputElement).value = inputs.iv;
        (document.getElementById("challenge-content") as HTMLInputElement).value = inputs.challengeContent;
    }
})()