import Papa from 'papaparse';
import type { TravelPackage, Hospital } from '@/types/travel';

export const parsePackagesCSV = async (): Promise<TravelPackage[]> => {
  const response = await fetch('/src/data/travel_packages.csv');
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as TravelPackage[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseHospitalsCSV = async (): Promise<Hospital[]> => {
  const response = await fetch('/src/data/travel_hospitals.csv');
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Hospital[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
