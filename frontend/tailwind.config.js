/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213D',      // navy tua - warna utama institusi
        signal: '#FF7A00',   // oranye sinyal - aksen status "aktif"
        paper: '#F7F5F0',    // latar netral hangat
        line: '#E4E0D6',
        moss: '#2E6F5E',     // hijau tua - status approved/alumni
        clay: '#B23A48',     // merah bata - status rejected/pengajuan tertahan
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
