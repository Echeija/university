async function run() {
  try {
    const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
    console.log("Success!");
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
run();
