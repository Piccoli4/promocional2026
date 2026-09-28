// Corre la calculadora de clasificación fuera del hilo principal: con
// muchos partidos pendientes tarda lo suficiente como para trabar la página.
import { analyzeQualification } from "../utils/qualificationCalculator";
import { FIXTURE } from "../data/fixture";

self.onmessage = (event) => {
    self.postMessage(analyzeQualification(event.data, FIXTURE));
};
