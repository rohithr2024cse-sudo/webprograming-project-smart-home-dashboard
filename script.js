const toast = document.getElementById('toast');
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function updateClock() {
  const now = new Date();
  document.getElementById('liveDate').textContent = now.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
  document.getElementById('liveTime').textContent = now.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
  const hour = now.getHours();
  document.getElementById('todayLabel').textContent = hour < 12 ? 'YOUR HOME THIS MORNING' : hour < 18 ? 'YOUR HOME AT A GLANCE' : 'YOUR HOME THIS EVENING';
  document.querySelector('h1').innerHTML = `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}<span class="wave"> ✦</span>`;
}
updateClock();
setInterval(updateClock, 30000);

const cards = [...document.querySelectorAll('.device-card')];
function setDevice(card, enabled, silent = false) {
  card.classList.toggle('on', enabled);
  card.querySelector('.toggle').classList.toggle('on', enabled);
  card.querySelector('.device-state').textContent = enabled ? 'On' : 'Off';
  const key = card.dataset.device;
  if (key === 'livingLight') {
    const slider = card.querySelector('.brightness-control');
    slider.disabled = !enabled;
    card.querySelector('.device-detail').textContent = enabled ? `${slider.value}% brightness` : 'Lights off';
  }
  if (key === 'ac') {
    card.querySelector('.device-detail').textContent = enabled ? `${acTemperature}°C · Cool` : 'Climate off';
    document.getElementById('acTemp').textContent = `${acTemperature}°C`;
  }
  if (key === 'security') {
    card.querySelector('.device-detail').innerHTML = enabled ? '<span class="tiny-green"></span> Monitoring' : 'Monitoring paused';
  }
  updateDeviceCount();
  if (!silent) notify(`${card.querySelector('h3').textContent} turned ${enabled ? 'on' : 'off'}.`);
}
function updateDeviceCount() {
  const active = cards.filter(c => c.classList.contains('on')).length;
  document.getElementById('onlineCount').textContent = active;
  document.querySelector('.device-progress span').style.width = `${active / cards.length * 100}%`;
  document.querySelector('.progress-caption strong').textContent = `${Math.round(active / cards.length * 100)}%`;
  document.getElementById('allDevicesButton').textContent = active === 0 ? 'Turn all on' : 'Turn all off';
}
cards.forEach(card => {
  const toggle = card.querySelector('.toggle');
  toggle.addEventListener('click', () => setDevice(card, !card.classList.contains('on')));
});
const brightness = document.querySelector('.brightness-control');
brightness.addEventListener('input', () => {
  const card = brightness.closest('.device-card');
  card.querySelector('.device-detail').textContent = `${brightness.value}% brightness`;
  if (brightness.value === '0') setDevice(card, false, true);
  else if (!card.classList.contains('on')) setDevice(card, true, true);
});
let acTemperature = 22;
function changeTemperature(delta) {
  acTemperature = Math.max(16, Math.min(30, acTemperature + delta));
  document.getElementById('acTemp').textContent = `${acTemperature}°C`;
  document.getElementById('tempSummary').textContent = `${acTemperature}°`;
  const acCard = document.querySelector('[data-device="ac"]');
  acCard.querySelector('.device-detail').textContent = acCard.classList.contains('on') ? `${acTemperature}°C · Cool` : 'Climate off';
  notify(`Air conditioner set to ${acTemperature}°C.`);
}
document.getElementById('tempDown').addEventListener('click', () => changeTemperature(-1));
document.getElementById('tempUp').addEventListener('click', () => changeTemperature(1));
document.getElementById('allDevicesButton').addEventListener('click', () => {
  const turnOn = cards.every(c => !c.classList.contains('on'));
  cards.forEach(c => setDevice(c, turnOn, true));
  notify(turnOn ? 'All devices turned on.' : 'All devices turned off.');
});
const scenes = {
  Home: { livingLight:true, ac:true, deskLamp:false, security:true, brightness:80, temperature:22, message:'Home scene is active. Welcome back!' },
  Focus: { livingLight:true, ac:true, deskLamp:true, security:true, brightness:65, temperature:22, message:'Focus scene activated. Ready to get things done.' },
  Relax: { livingLight:true, ac:false, deskLamp:true, security:true, brightness:25, temperature:24, message:'Relax scene activated. Take a breath and unwind.' },
  Away: { livingLight:false, ac:false, deskLamp:false, security:true, brightness:0, temperature:26, message:'Away scene activated. Lights off, security monitoring on.' }
};
document.querySelectorAll('.scene-card').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.scene;
    const scene = scenes[name];
    document.querySelectorAll('.scene-card').forEach(b => b.classList.toggle('active-scene', b === button));
    cards.forEach(card => setDevice(card, scene[card.dataset.device], true));
    acTemperature = scene.temperature;
    document.getElementById('acTemp').textContent = `${acTemperature}°C`;
    document.getElementById('tempSummary').textContent = `${acTemperature}°`;
    const lightCard = document.querySelector('[data-device="livingLight"]');
    lightCard.querySelector('.brightness-control').value = scene.brightness;
    lightCard.querySelector('.device-detail').textContent = scene.livingLight ? `${scene.brightness}% brightness` : 'Lights off';
    document.getElementById('sceneFeedback').textContent = scene.message;
    updateDeviceCount();
    notify(`${name} scene activated.`);
  });
});
document.getElementById('themeButton').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  notify(document.body.classList.contains('dark-mode') ? 'Dark mode enabled.' : 'Light mode enabled.');
});
document.getElementById('tipsButton').addEventListener('click', () => notify('Tip: Try a Scene to control several devices at once.'));
document.getElementById('moreScenes').addEventListener('click', () => notify('Choose Home, Focus, Relax, or Away to switch scenes.'));
document.getElementById('viewRooms').addEventListener('click', () => notify('Showing all rooms currently available in this demo.'));
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
}));
brightness.disabled = false;
updateDeviceCount();
