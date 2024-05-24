import { ArticleEntity } from "src/articles/entities/article.entity";

export interface ServerToClientEvents {
    newArticle: (payload: ArticleEntity) => void;
}