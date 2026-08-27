/**
 * Main Thread Worker Bridge
 * Handles asynchronous background physics streaming to React Three Fiber.
 */
export class PhysicsBridge {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.onTickCallback = null;
  }

  init(resolution = 10, initialTempK = 298.15) {
    if (typeof window === 'undefined') return;

    this.worker = new Worker(new URL('./physicsWorker.js', import.meta.url));

    this.worker.onmessage = (e) => {
      const { type, payload } = e.data;

      if (type === 'GRID_READY') {
        this.isReady = true;
      } else if (type === 'TICK_COMPLETE' && this.onTickCallback) {
        this.onTickCallback(payload);
      }
    };

    this.worker.postMessage({
      type: 'INIT_GRID',
      payload: { resolution, initialTempK },
    });
  }

  stepSimulation(deltaTime, appliedCurrentAmps, ambientTempK = 298.15) {
    if (!this.worker || !this.isReady) return;

    this.worker.postMessage({
      type: 'SIMULATION_STEP',
      payload: { deltaTime, appliedCurrentAmps, ambientTempK },
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.isReady = false;
    }
  }
}
