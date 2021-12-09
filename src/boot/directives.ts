import { boot } from 'quasar/wrappers';
import useUser from 'src/modules/useUser';

interface Node {
  dataset: {
    timer: NodeJS.Timeout;
  };
}

export default boot(({ app }) => {
  console.log('directives');
  app.directive('auth', {
    beforeMount(el: Node) {
      const { user } = useUser();
      if (!user.value) {
        window.location.href = '/';
      }

      const timer = setInterval(() => {
        if (!user.value) {
          clearInterval(timer);
          window.location.href = '/';
        }
      }, 5000);

      el.dataset.timer = timer;
    },
    beforeUnmount(el: Node) {
      clearInterval(el.dataset.timer);
    },
  });
});
