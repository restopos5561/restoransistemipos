import { Request, Response } from 'express';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerInput, UpdateCustomerInput } from '../schemas/customer.schema';

export class CustomersController {
  private customersService: CustomersService;

  constructor() {
    this.customersService = new CustomersService();
  }

  async getCustomers(req: Request, res: Response) {
    const { search, phoneNumber, email, page = 1, limit = 10, restaurantId } = req.query;

    const customers = await this.customersService.getCustomers({
      search: search as string,
      phoneNumber: phoneNumber as string,
      email: email as string,
      page: Number(page),
      limit: Number(limit),
      restaurantId: Number(restaurantId),
    });

    res.json({ success: true, data: customers });
  }

  async createCustomer(req: Request, res: Response) {
    const data: CreateCustomerInput = req.body;
    const customer = await this.customersService.createCustomer(data);
    res.status(201).json({ success: true, data: customer });
  }

  async getCustomerById(req: Request, res: Response) {
    const { id } = req.params;
    const customer = await this.customersService.getCustomerById(Number(id));
    res.json({ success: true, data: customer });
  }

  async updateCustomer(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateCustomerInput = req.body;
    const customer = await this.customersService.updateCustomer(Number(id), data);
    res.json({ success: true, data: customer });
  }

  async deleteCustomer(req: Request, res: Response) {
    const { id } = req.params;
    await this.customersService.deleteCustomer(Number(id));
    res.status(204).send();
  }

  async getCustomerOrders(req: Request, res: Response) {
    const { id } = req.params;
    const orders = await this.customersService.getCustomerOrders(Number(id));
    res.json({ success: true, data: orders });
  }
}
