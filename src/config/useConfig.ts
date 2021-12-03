import { toRefs } from 'vue';
import { drawerMenu } from './drawerMenu';
import { siteConfig } from '../APPLICATION/condfig/site';

export default function useConfig() {
  return {
    ...toRefs(drawerMenu),
    site: siteConfig,
  };
}
