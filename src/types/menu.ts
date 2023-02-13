export type Menu = {
  id: number;
  title: string;
  name: string;
  path: string;
  hidden: boolean;
  isAuth: boolean;
  icon: string;
  view: string;
  children: Menu[];
  sort?: number;
};
