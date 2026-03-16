'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'mist' | 'storm' | 'neutral';

interface WeatherThemeContextType {
  weatherCondition: WeatherType;
  setWeatherCondition: (condition: WeatherType) => void;
}

const WeatherThemeContext = createContext<WeatherThemeContextType | undefined>(undefined);

export const WeatherThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [weatherCondition, setWeatherCondition] = useState<WeatherType>('neutral');

  // Logic to sync weather with CSS variables or data attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-weather', weatherCondition);
  }, [weatherCondition]);

  return (
    <WeatherThemeContext.Provider value={{ weatherCondition, setWeatherCondition }}>
      <div className={`transition-all duration-1000 wandra-weather-${weatherCondition}`}>
        {children}
      </div>
    </WeatherThemeContext.Provider>
  );
};

export const useWeatherTheme = () => {
  const context = useContext(WeatherThemeContext);
  if (!context) throw new Error('useWeatherTheme must be used within WeatherThemeProvider');
  return context;
};
