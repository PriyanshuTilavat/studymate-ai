import { materials } from "./mockData";
import type { Material } from "../types";

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export const materialService = {
  async list(): Promise<Material[]> {
    await wait();
    return materials;
  },
  async get(id: string): Promise<Material | undefined> {
    await wait(120);
    return materials.find((material) => material.id === id);
  },
  async stageFile(file: File, onProgress: (value: number) => void): Promise<{ fileName: string; size: number }> {
    // This reads the real local file into memory. Server analysis starts only after a backend is connected.
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        onProgress(100);
        resolve({ fileName: file.name, size: file.size });
      };
      reader.readAsArrayBuffer(file);
    });
  },
};
