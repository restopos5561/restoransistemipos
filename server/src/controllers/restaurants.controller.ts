import { Request, Response } from 'express';
import { RestaurantsService } from '../services/restaurants.service';
import { BadRequestError } from '../errors/bad-request-error';

export class RestaurantsController {
  private restaurantsService: RestaurantsService;

  constructor() {
    this.restaurantsService = new RestaurantsService();
  }

  getRestaurants = async (req: Request, res: Response) => {
    const restaurants = await this.restaurantsService.getRestaurants();
    res.status(200).json({
      success: true,
      data: restaurants,
    });
  };

  getRestaurantById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const restaurant = await this.restaurantsService.getRestaurantById(Number(id));

    if (!restaurant) {
      throw new BadRequestError('Restaurant not found');
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  };

  createRestaurant = async (req: Request, res: Response) => {
    const restaurant = await this.restaurantsService.createRestaurant(req.body);
    res.status(201).json({
      success: true,
      data: restaurant,
    });
  };

  updateRestaurant = async (req: Request, res: Response) => {
    const { id } = req.params;
    const restaurant = await this.restaurantsService.updateRestaurant(Number(id), req.body);
    res.status(200).json({
      success: true,
      data: restaurant,
    });
  };

  deleteRestaurant = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.restaurantsService.deleteRestaurant(Number(id));
    res.status(204).send();
  };
}
