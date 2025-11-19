const { resend } = require('../../config/resend');

class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.rateLimitMs = 500; // 500ms between emails = 2 emails per second
    this.lastSentTime = 0;
  }

  /**
   * Add an email to the queue
   * @param {Object} emailData - Email data to send
   * @param {Function} resolve - Promise resolve function
   * @param {Function} reject - Promise reject function
   */
  enqueue(emailData, resolve, reject) {
    this.queue.push({
      emailData,
      resolve,
      reject,
      timestamp: Date.now()
    });

    // Start processing if not already processing
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process the queue with rate limiting
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift(); // FIFO - remove from front

      try {
        // Rate limiting: ensure at least 500ms between emails
        const timeSinceLastSent = Date.now() - this.lastSentTime;
        if (timeSinceLastSent < this.rateLimitMs) {
          await this.sleep(this.rateLimitMs - timeSinceLastSent);
        }

        // Send email via Resend
        const result = await resend.emails.send(item.emailData);
        this.lastSentTime = Date.now();

        // Resolve the promise
        item.resolve({
          success: true,
          result,
          queuedAt: item.timestamp,
          sentAt: Date.now()
        });
      } catch (error) {
        // Reject the promise with error
        item.reject({
          success: false,
          error: error.message || 'Failed to send email',
          queuedAt: item.timestamp,
          failedAt: Date.now()
        });
      }
    }

    this.processing = false;
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastSentTime: this.lastSentTime
    };
  }
}

// Singleton instance
const emailQueue = new EmailQueue();

module.exports = { emailQueue };

