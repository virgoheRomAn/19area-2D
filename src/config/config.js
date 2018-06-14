window.Native.getBootParams();
//通过Native配置请求的HOST
const HOST = window.Native.Golbal.host;
export default {
  memberGid: window.BootParams['--memberGid'],
  token: window.BootParams['--token'],
  host: HOST
}