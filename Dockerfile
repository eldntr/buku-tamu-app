# 1. Gunakan base image Node.js versi Long-Term Support (LTS)
FROM node:18-alpine

# 2. Tetapkan direktori kerja di dalam container
WORKDIR /app

# 3. Salin package.json dan package-lock.json untuk menginstal dependensi
COPY package*.json ./

# 4. Instal dependensi aplikasi
RUN npm install

# 5. Salin sisa file aplikasi ke dalam direktori kerja
COPY . .

# 6. Ekspos port yang digunakan oleh aplikasi
EXPOSE 3000

# 7. Definisikan perintah untuk menjalankan aplikasi saat container dimulai
CMD [ "node", "server.js" ]