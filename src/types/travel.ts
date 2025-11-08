export interface TravelPackage {
  Package_ID: number;
  Package_Name: string;
  Destination: string;
  Country: string;
  Duration_Days: number;
  Price_USD: number;
  Accommodation_Type: string;
  Transport_Mode: string;
  Season: string;
  Accessibility_Level: string;
  Description: string;
  Rating: number;
  Available_Slots: number;
  Guide_Included: string;
  Start_Date: string;
  End_Date: string;
  Category: string;
  Discount_Percent: number;
  Meals_Included: string;
  Contact_Number: string;
}

export interface Hospital {
  Hospital_ID: string;
  Package_ID: number;
  Hospital_Name: string;
  Hospital_Type: string;
  City: string;
  Country: string;
  Emergency_Number: string;
  Address: string;
  Distance_km_From_Destination: number;
  "24x7_Service": string;
  Ambulance_Available: string;
  Latitude: number;
  Longitude: number;
  SOS_Response_Time_Min: number;
  Languages_Supported: string;
  Notes: string;
}
