// Configuração de cores/fonte do Tailwind
if (window.tailwind) tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        babyPink: {
                            50: '#FFF0F5',
                            100: '#FFE4E1',
                            200: '#FFC0CB',
                            300: '#FFB6C1', // Cor principal Rosa Bebê
                            400: '#FF99AA',
                            500: '#FF7788',
                            600: '#E05566',
                        },
                        darkBg: '#101116',
                        darkCard: '#191B23',
                        darkBorder: '#303440',
                    },
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                    }
                }
            }
        }
