import { setInterval } from 'timers';
import { showMessage } from '@/components/atoms';

class ErrorHandler {
  messages: any[];

  debounce: number;

  filteredMessages: string[];

  constructor() {
    this.messages = [];
    this.debounce = 15000;
    this.filteredMessages = ['Profile picture not found for provided user', 'could not find entity', 'not found'];

    this.initIntervals();
  }

  purgeOldMessages = () => {
    this.messages = this.messages.filter((i) => i.expiresIn > Date.now());
  };

  initIntervals = () => {
    setInterval(this.purgeOldMessages, this.debounce);
  };

  handleError = (errorMessage: string[], forceShow: boolean = false) => {
    if (forceShow) {
      return errorMessage?.forEach((message) => showMessage('error', message));
    }

    const shouldShow =
      !this.messages.some((i) => i.message === errorMessage) &&
      !this.filteredMessages.some((i) => errorMessage.includes(i));

    if (!shouldShow) return null;

    this.messages.push({
      message: errorMessage,
      expiresIn: Date.now() + this.debounce,
    });

    errorMessage?.forEach((message) => showMessage('error', message));
  };
}

export const errorHandler = new ErrorHandler();

export default async function errorHandling(error: any, forceShow: boolean = false) {
  let message = null;

  if (error?.response?.data?.errorReasons) {
    message = error?.response?.data?.errorReasons;
  } else if (error?.errorReasons) {
    message = error?.errorReasons;
  }

  if (message) errorHandler.handleError(message, forceShow);
}
