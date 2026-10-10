import type { Locale } from './config';

// Minimal labels available even when the translation provider has failed.
export const errorLabels: Record<Locale, { pageError: string; pageErrorDescription: string; tryAgain: string; goHome: string; errorId: string }> = {
  "en": {
    "pageError": "Something went wrong",
    "pageErrorDescription": "An unexpected error occurred. Please try again.",
    "tryAgain": "Try again",
    "goHome": "Go home",
    "errorId": "Error ID: {id}"
  },
  "ja": {
    "pageError": "何か問題が発生しました",
    "pageErrorDescription": "予期しないエラーが発生しました。もう一度試してください。",
    "tryAgain": "もう一度試してください",
    "goHome": "家に帰りなさい",
    "errorId": "エラーID: {id}"
  },
  "ko": {
    "pageError": "문제가 발생했습니다.",
    "pageErrorDescription": "예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.",
    "tryAgain": "다시 시도하세요",
    "goHome": "집에 가세요",
    "errorId": "Error ID: {id}"
  },
  "es": {
    "pageError": "algo salió mal",
    "pageErrorDescription": "Se produjo un error inesperado. Por favor inténtalo de nuevo.",
    "tryAgain": "Intentar otra vez",
    "goHome": "Ir a casa",
    "errorId": "Error ID: {id}"
  },
  "fr": {
    "pageError": "Quelque chose s'est mal passé",
    "pageErrorDescription": "Une erreur inattendue s'est produite. Veuillez réessayer.",
    "tryAgain": "Essayer à nouveau",
    "goHome": "Rentre chez toi",
    "errorId": "Error ID: {id}"
  },
  "de": {
    "pageError": "Etwas ist schief gelaufen",
    "pageErrorDescription": "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    "tryAgain": "Versuchen Sie es erneut",
    "goHome": "Geh nach Hause",
    "errorId": "Error ID: {id}"
  },
  "zh": {
    "pageError": "Something went wrong",
    "pageErrorDescription": "An unexpected error occurred. Please try again.",
    "tryAgain": "Try again",
    "goHome": "Go home",
    "errorId": "Error ID: {id}"
  },
  "zh-TW": {
    "pageError": "發生錯誤",
    "pageErrorDescription": "發生非預期錯誤，請再試一次。",
    "tryAgain": "再試一次",
    "goHome": "返回首頁",
    "errorId": "錯誤代碼：{id}"
  },
  "pt": {
    "pageError": "Algo deu errado",
    "pageErrorDescription": "Ocorreu um erro inesperado. Por favor, tente novamente.",
    "tryAgain": "Tente novamente",
    "goHome": "Ir para casa",
    "errorId": "Error ID: {id}"
  },
  "ar": {
    "pageError": "حدث خطأ ما",
    "pageErrorDescription": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    "tryAgain": "إعادة المحاولة",
    "goHome": "الذهاب إلى الصفحة الرئيسية",
    "errorId": "Error ID: {id}"
  },
  "it": {
    "pageError": "Qualcosa è andato storto",
    "pageErrorDescription": "Si è verificato un errore imprevisto. Per favore riprova.",
    "tryAgain": "Riprova",
    "goHome": "Vai a casa",
    "errorId": "Error ID: {id}"
  },
  "id": {
    "pageError": "Terjadi kesalahan",
    "pageErrorDescription": "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
    "tryAgain": "Coba lagi",
    "goHome": "Kembali ke beranda",
    "errorId": "Error ID: {id}"
  },
  "vi": {
    "pageError": "Đã xảy ra lỗi",
    "pageErrorDescription": "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
    "tryAgain": "Thử lại",
    "goHome": "Về trang chủ",
    "errorId": "Error ID: {id}"
  },
  "ro": {
    "pageError": "Ceva nu a funcționat corect",
    "pageErrorDescription": "A apărut o eroare neașteptată. Vă rugăm să încercați din nou.",
    "tryAgain": "Încercați din nou",
    "goHome": "Mergi acasă",
    "errorId": "Error ID: {id}"
  },
  "pl": {
    "pageError": "Coś poszło nie tak",
    "pageErrorDescription": "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    "tryAgain": "Spróbuj ponownie",
    "goHome": "Przejdź do strony głównej",
    "errorId": "Error ID: {id}"
  }
};
