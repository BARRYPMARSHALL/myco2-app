// Crypto API integration for real-time cryptocurrency prices
// Using CoinGecko's free API for crypto price data

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const cryptoApi = {
  // Get current prices for multiple cryptocurrencies
  async getCurrentPrices(coinIds = ['bitcoin', 'ethereum', 'binancecoin']) {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return { data: null, error: error.message };
    }
  },

  // Get detailed coin information
  async getCoinDetails(coinId = 'bitcoin') {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching coin details:', error);
      return { data: null, error: error.message };
    }
  },

  // Get trending cryptocurrencies
  async getTrendingCoins() {
    try {
      const response = await fetch(`${COINGECKO_BASE_URL}/search/trending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data: data.coins, error: null };
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return { data: null, error: error.message };
    }
  },

  // Get market data for top cryptocurrencies
  async getTopCoins(limit = 10) {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching top coins:', error);
      return { data: null, error: error.message };
    }
  },

  // Format price with appropriate decimal places
  formatPrice(price) {
    if (price >= 1) {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 6
      });
    }
  },

  // Format percentage change with color indication
  formatPercentageChange(change) {
    const formatted = change.toFixed(2);
    return {
      value: formatted,
      isPositive: change >= 0,
      display: `${change >= 0 ? '+' : ''}${formatted}%`
    };
  },

  // Format market cap
  formatMarketCap(marketCap) {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  },

  // Get crypto data for giveaway display
  async getGiveawayPrizes() {
    try {
      const { data, error } = await this.getCurrentPrices(['bitcoin', 'ethereum']);
      
      if (error) {
        // Return fallback data if API fails
        return {
          data: {
            bitcoin: { usd: 45000, usd_24h_change: 2.5 },
            ethereum: { usd: 3000, usd_24h_change: 1.8 }
          },
          error: null
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching giveaway prizes:', error);
      return {
        data: {
          bitcoin: { usd: 45000, usd_24h_change: 2.5 },
          ethereum: { usd: 3000, usd_24h_change: 1.8 }
        },
        error: error.message
      };
    }
  },

  // Calculate prize values in USD
  calculatePrizeValues(cryptoPrices) {
    const prizes = {
      weekly: {
        amount: 1000, // $1000 worth
        bitcoin: {
          amount: 1000 / (cryptoPrices.bitcoin?.usd || 45000),
          usdValue: 1000
        }
      },
      monthly: {
        amount: 5000, // $5000 worth
        ethereum: {
          amount: 5000 / (cryptoPrices.ethereum?.usd || 3000),
          usdValue: 5000
        }
      },
      mega: {
        amount: 100000, // $100K worth
        mixed: {
          bitcoin: 50000 / (cryptoPrices.bitcoin?.usd || 45000),
          ethereum: 50000 / (cryptoPrices.ethereum?.usd || 3000),
          usdValue: 100000
        }
      }
    };

    return prizes;
  }
};

// Real-time price updater class
export class CryptoPriceUpdater {
  constructor(updateInterval = 30000) { // 30 seconds default
    this.updateInterval = updateInterval;
    this.isRunning = false;
    this.intervalId = null;
    this.subscribers = [];
  }

  // Subscribe to price updates
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers
  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in price update subscriber:', error);
      }
    });
  }

  // Start real-time updates
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Initial fetch
    this.fetchAndNotify();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.fetchAndNotify();
    }, this.updateInterval);
  }

  // Stop real-time updates
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Fetch prices and notify subscribers
  async fetchAndNotify() {
    try {
      const { data, error } = await cryptoApi.getCurrentPrices();
      
      if (!error && data) {
        this.notifySubscribers({
          type: 'price_update',
          data: data,
          timestamp: new Date().toISOString()
        });
      } else {
        this.notifySubscribers({
          type: 'error',
          error: error || 'Failed to fetch prices',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in fetchAndNotify:', error);
      this.notifySubscribers({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update interval
  setUpdateInterval(newInterval) {
    this.updateInterval = newInterval;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

export default cryptoApi;

