const { onValueCreated } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

exports.sendPushOnNotification = onValueCreated(
  {
    ref: "/zelenilo/notifications/{notifId}",
    region: "europe-west1",
  },
  async (event) => {
    const data = event.data.val();
    if (!data) return;

    const db = getDatabase();

    // Dohvati sve FCM tokene
    const subsSnap = await db.ref("zelenilo/push_subs").get();
    if (!subsSnap.exists()) return;

    const tokens = [];
    subsSnap.forEach((child) => {
      const sub = child.val();
      if (sub?.token && sub?.user !== data.from) {
        tokens.push(sub.token);
      }
    });

    if (tokens.length === 0) return;

    // Šalji push svima osim pošiljatelju
    const messaging = getMessaging();

    const results = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: data.title || "Smart Zelenilo",
        body: data.body || "",
      },
      webpush: {
        notification: {
          icon: "https://zelenilo-rovinj.github.io/smart-zelenilo/icon-192.png",
          badge: "https://zelenilo-rovinj.github.io/smart-zelenilo/icon-192.png",
          vibrate: [300, 100, 300],
          tag: "sz-push",
          renotify: true,
        },
        fcmOptions: {
          link: "https://zelenilo-rovinj.github.io/smart-zelenilo/",
        },
      },
    });

    // Očisti nevažeće tokene
    const updates = {};
    results.responses.forEach((resp, i) => {
      if (!resp.success) {
        const err = resp.error?.code;
        if (
          err === "messaging/invalid-registration-token" ||
          err === "messaging/registration-token-not-registered"
        ) {
          // Pronađi i ukloni token
          subsSnap.forEach((child) => {
            if (child.val()?.token === tokens[i]) {
              updates[`zelenilo/push_subs/${child.key}`] = null;
            }
          });
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }

    // Obriši obavijest nakon slanja
    await event.data.ref.remove();
  }
);