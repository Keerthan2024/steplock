export async function sendWalkToBackend(fileUri) {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'application/json',
    name: 'walk.json',
  });

  try {
    const res = await fetch('http://10.113.47.239:5000/predict', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const text = await res.text(); // read raw response

    console.log("📦 Raw backend response:", text);

    // Try to parse only if it looks like JSON
    const result = JSON.parse(text);

    console.log("🧠 Parsed JSON:", result);
    return result;
  } catch (err) {
    console.error("❌ Failed to connect to backend or parse JSON:", err);
    return { result: "Error", confidence: 0 };
  }
}
