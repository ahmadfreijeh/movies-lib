import { GenreRepository } from "../repositories/GenreRepository";
import { Genre } from "../types";

export class GenreService {
  private readonly genreRepository: GenreRepository;

  constructor() {
    this.genreRepository = new GenreRepository();
  }

  async list(): Promise<Genre[]> {
    return this.genreRepository.findAll();
  }
}
