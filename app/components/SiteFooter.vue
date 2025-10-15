<template>
  <footer class="site-footer">
    <div class="wrap">
      <p>© {{ new Date().getFullYear() }} by Chechet Sergey </p>
      <p>
        <a href="https://t.me/s_chechet">https://t.me/s_chechet</a> 
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  margin-top: 48px;
  border-top: 1px solid rgba(16,24,40,.06);
  background: #fff;
  line-height: 0.4;
}
.wrap {
  max-width: 1200px; margin: 0 auto; padding: 16px;
  color: rgba(16,24,40,.7); font-size: 10px; text-align: center;
  opacity: 0.7;
}
.wrap a {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  outline: none;
}
.wrap a:hover {
  opacity: 1;
}
.wrap a:visited {
  color: inherit;
}
</style>
