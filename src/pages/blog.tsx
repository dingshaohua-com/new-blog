import api from "@/api";
import { useMount } from "ahooks";

function Blog() {
  useMount(async () => {
    const res = await api.article.list()
    console.log(res);
  });
  return <div>123</div>;
}

export default Blog;
