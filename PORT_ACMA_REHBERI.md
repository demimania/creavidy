
# Sunucu Portunu (3005) Aktif Etme Rehberi

Ekran görüntüsünde gördüğüm kadarıyla komutu **yanlış klasörde** çalıştırıyorsunuz. `home` klasöründesiniz, ancak proje `Documents/Creavidy` içinde.

Lütfen sırasıyla şu komutları uygulayın:

### 1. Adım: Doğru Klasöre Git
Önce proje klasörüne girmelisiniz:

```bash
cd /Users/demi/Documents/Creavidy
```

### 2. Adım: Sunucuyu Başlat
Klasöre girdikten sonra port 3005 ile başlatın:

```bash
npm run dev -- -p 3005
```

---

### Hata Alırsanız (Port Doluysa)
Eğer "Port 3005 is already in use" derse:

```bash
lsof -t -i:3005 | xargs kill -9
```
Komutunu uygulayıp tekrar **2. Adım**ı deneyin.
