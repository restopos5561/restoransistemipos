import { PrismaClient, StockTransactionType } from '@prisma/client';
import { hashPassword } from '../src/utils/auth.utils';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Restaurant oluştur (restaurants.postman_collection.json'a göre)
        const restaurant = await prisma.restaurant.create({
            data: { 
                name: "Test Restaurant",
                address: "Test Address",
                phone: "555-0123",
                email: "test@restaurant.com"
            }
        });

        // 2. Branch oluştur (branches.postman_collection.json'a göre)
        const branches = await Promise.all([
            prisma.branch.create({
                data: {
                    name: "Ana Şube",
                    restaurantId: restaurant.id,
                    isMainBranch: true,
                    address: "Branch Address",
                    settings: {
                        create: {
                            currency: "TRY",
                            timezone: "Europe/Istanbul",
                            dailyCloseTime: "23:00",
                            workingHours: "09:00-23:00"
                        }
                    }
                }
            }),
            // İkinci şube eklendi
            prisma.branch.create({
                data: {
                    name: "İkinci Şube",
                    restaurantId: restaurant.id,
                    isMainBranch: false,
                    address: "Second Branch Address",
                    settings: {
                        create: {
                            currency: "TRY",
                            timezone: "Europe/Istanbul",
                            dailyCloseTime: "23:00",
                            workingHours: "09:00-23:00"
                        }
                    }
                }
            })
        ]);

        // 3. Kategoriler oluştur (categories.postman_collection.json'a göre)
        const categories = await Promise.all([
            prisma.category.create({
                data: {
                    name: "Hammaddeler",
                    restaurantId: restaurant.id,
                    type: "OTHER"
                }
            }),
            prisma.category.create({
                data: {
                    name: "Ana Yemekler",
                    restaurantId: restaurant.id,
                    type: "FOOD"
                }
            }),
            prisma.category.create({
                data: {
                    name: "Mezeler",
                    restaurantId: restaurant.id,
                    type: "FOOD"
                }
            }),
            prisma.category.create({
                data: {
                    name: "İçecekler",
                    restaurantId: restaurant.id,
                    type: "BEVERAGE"
                }
            }),
            prisma.category.create({
                data: {
                    name: "Tatlılar",
                    restaurantId: restaurant.id,
                    type: "FOOD"
                }
            })
        ]);

        // Ürünler için seed verileri
        console.log('Creating products...');
        const products = await Promise.all([
            // Hammaddeler
            prisma.product.create({
                data: {
                    name: "Domates",
                    categoryId: categories[0].id, // Hammaddeler
                    price: 4.5,
                    unit: "KG",
                    type: "RAW_MATERIAL",
                    restaurantId: restaurant.id,
                    cost: 3.5,
                    stockTracking: true
                }
            }),
            prisma.product.create({
                data: {
                    name: "Salatalık",
                    categoryId: categories[0].id, // Hammaddeler
                    price: 2.5,
                    unit: "KG",
                    type: "RAW_MATERIAL",
                    restaurantId: restaurant.id,
                    cost: 2.0,
                    stockTracking: true
                }
            }),
            // Ana Yemekler
            prisma.product.create({
                data: {
                    name: "Köfte Porsiyon",
                    categoryId: categories[1].id, // Ana Yemekler
                    price: 150.0,
                    unit: "PORTION",
                    type: "PREPARED_FOOD",
                    restaurantId: restaurant.id,
                    cost: 85.0,
                    preparationTime: 20,
                    stockTracking: false
                }
            }),
            prisma.product.create({
                data: {
                    name: "Tavuk Şiş",
                    categoryId: categories[1].id, // Ana Yemekler
                    price: 120.0,
                    unit: "PORTION",
                    type: "PREPARED_FOOD",
                    restaurantId: restaurant.id,
                    cost: 65.0,
                    preparationTime: 25,
                    stockTracking: false
                }
            }),
            // İçecekler
            prisma.product.create({
                data: {
                    name: "Cola (330ml)",
                    categoryId: categories[3].id, // İçecekler
                    price: 30.0,
                    unit: "PIECE",
                    type: "READY_TO_SERVE",
                    restaurantId: restaurant.id,
                    cost: 15.0,
                    stockTracking: true
                }
            }),
            prisma.product.create({
                data: {
                    name: "Ayran (300ml)",
                    categoryId: categories[3].id, // İçecekler
                    price: 20.0,
                    unit: "PIECE",
                    type: "READY_TO_SERVE",
                    restaurantId: restaurant.id,
                    cost: 8.0,
                    stockTracking: true
                }
            })
        ]);

        console.log('✅ Products seed data created successfully');

        // Ürün seçenek grupları ve seçenekleri oluştur
        const optionGroups = await Promise.all([
            // Köfte için ekstralar
            prisma.productOptionGroup.create({
                data: {
                    productId: products[0].id, // Köfte ürünü
                    name: "Ekstralar",
                    isRequired: false,
                    minQuantity: 0,
                    maxQuantity: 5,
                    options: {
                        create: [
                            {
                                name: "Ekstra Köfte",
                                priceAdjustment: 50,
                                productId: products[0].id
                            },
                            {
                                name: "Ekstra Peynir",
                                priceAdjustment: 15,
                                productId: products[0].id
                            }
                        ]
                    }
                }
            }),
            // Köfte için soslar
            prisma.productOptionGroup.create({
                data: {
                    productId: products[0].id, // Köfte ürünü
                    name: "Soslar",
                    isRequired: true,
                    minQuantity: 1,
                    maxQuantity: 3,
                    options: {
                        create: [
                            {
                                name: "Ketçap",
                                priceAdjustment: 0,
                                productId: products[0].id
                            },
                            {
                                name: "Mayonez",
                                priceAdjustment: 0,
                                productId: products[0].id
                            },
                            {
                                name: "Acı Sos",
                                priceAdjustment: 0,
                                productId: products[0].id
                            }
                        ]
                    }
                }
            }),
            // Cola için boyutlar
            prisma.productOptionGroup.create({
                data: {
                    productId: products[1].id, // Cola ürünü
                    name: "Boyut",
                    isRequired: true,
                    minQuantity: 1,
                    maxQuantity: 1,
                    options: {
                        create: [
                            {
                                name: "Küçük (250ml)",
                                priceAdjustment: -5,
                                productId: products[1].id
                            },
                            {
                                name: "Orta (330ml)",
                                priceAdjustment: 0,
                                productId: products[1].id
                            },
                            {
                                name: "Büyük (500ml)",
                                priceAdjustment: 10,
                                productId: products[1].id
                            }
                        ]
                    }
                }
            })
        ]);

        console.log('✅ Product options seed data created successfully');

        // 5. Kullanıcıları oluştur
        const hashedPassword = await hashPassword("123456");
        
        // Önce admin kullanıcısını oluştur
        const adminUser = await prisma.user.create({
            data: {
                name: "Test Admin",
                email: "test@example.com",
                password: hashedPassword,
                role: "ADMIN",
                branchId: branches[0].id, // Ana şubesi branches[0]
                restaurantId: restaurant.id
            }
        });

        // Admin kullanıcısını diğer şubelere de ekle
        await prisma.userBranch.createMany({
            data: branches.map(branch => ({
                userId: adminUser.id,
                branchId: branch.id
            }))
        });

        // Diğer kullanıcıları oluştur
        const otherUsers = await Promise.all([
            // Mutfak personeli
            prisma.user.create({
                data: {
                    name: "Kitchen Staff",
                    email: "kitchen@example.com",
                    password: hashedPassword,
                    role: "CHEF",
                    branchId: branches[0].id,
                    restaurantId: restaurant.id,
                    userBranches: {
                        create: {
                            branchId: branches[0].id
                        }
                    }
                }
            }),
            // Bar personeli
            prisma.user.create({
                data: {
                    name: "Bar Staff",
                    email: "bar@example.com",
                    password: hashedPassword,
                    role: "BAR",
                    branchId: branches[0].id,
                    restaurantId: restaurant.id
                }
            })
        ]);

        console.log('Seed completed successfully');
        console.log('Admin user created:', adminUser);
        console.log('Admin user branches:', await prisma.userBranch.findMany({
            where: { userId: adminUser.id },
            include: { branch: true }
        }));

        // 6. Masa oluştur (tables.postman_collection.json'a göre)
        const tables = await Promise.all([
            prisma.table.create({
                data: {
                    tableNumber: "A1",
                    capacity: 4,
                    branchId: branches[0].id
                }
            }),
            prisma.table.create({
                data: {
                    tableNumber: "A2",
                    capacity: 4,
                    branchId: branches[0].id
                }
            })
        ]);

        // 7. Siparişler oluştur
        await Promise.all([
            // Mutfak siparişi - Köfte ve Cola
            prisma.order.create({
                data: {
                    branchId: branches[0].id,
                    restaurantId: restaurant.id,
                    tableId: tables[0].id,
                    waiterId: otherUsers[0].id,
                    status: "PENDING",
                    orderSource: "IN_STORE",
                    totalAmount: 180, // 150 (köfte) + 30 (cola)
                    orderItems: {
                        create: [
                            {
                                productId: products[2].id, // Köfte Porsiyon
                                quantity: 1,
                                unitPrice: 150,
                                orderItemStatus: "PENDING",
                                type: "SALE"
                            },
                            {
                                productId: products[4].id, // Cola
                                quantity: 1,
                                unitPrice: 30,
                                orderItemStatus: "PENDING",
                                type: "SALE"
                            }
                        ]
                    }
                }
            }),
            // Bar siparişi - 2 Cola
            prisma.order.create({
                data: {
                    branchId: branches[0].id,
                    restaurantId: restaurant.id,
                    tableId: tables[1].id,
                    waiterId: otherUsers[1].id, // Bar personeli
                    status: "PENDING",
                    orderSource: "IN_STORE",
                    totalAmount: 60, // 2 x 30 (cola)
                    orderItems: {
                        create: {
                            productId: products[4].id, // Cola
                            quantity: 2,
                            unitPrice: 30,
                            orderItemStatus: "PENDING",
                            type: "SALE"
                        }
                    }
                }
            })
        ]);

        // Siparişler oluşturulduktan sonra, indirimler eklenir
        const orders = await prisma.order.findMany(); // Tüm siparişleri al

        // İndirim örnekleri oluştur
        await prisma.discount.createMany({
            data: [
                {
                    orderId: orders[0].id,
                    discountType: "PERCENTAGE",
                    discountAmount: 10, // %10 indirim
                    note: "Öğrenci indirimi",
                    createdAt: new Date()
                },
                {
                    orderId: orders[0].id,
                    orderItemId: 1,
                    discountType: "FIXED_AMOUNT",
                    discountAmount: 15, // 15 TL indirim
                    note: "Kampanya indirimi",
                    createdAt: new Date()
                }
            ]
        });

        // Stok verileri
        const stocks = [
            {
                productId: products[0].id, // Domates
                branchId: branches[0].id,
                quantity: 25,  // 25 kg
                lowStockThreshold: 10,
                idealStockLevel: 30,
                expirationDate: new Date('2024-01-20')
            },
            {
                productId: products[1].id, // Salatalık
                branchId: branches[0].id,
                quantity: 15,  // 15 kg
                lowStockThreshold: 8,
                idealStockLevel: 20,
                expirationDate: new Date('2024-01-18')
            },
            {
                productId: products[4].id, // Cola
                branchId: branches[0].id,
                quantity: 120, // 120 adet
                lowStockThreshold: 50,
                idealStockLevel: 200,
                expirationDate: new Date('2024-06-30')
            },
            {
                productId: products[5].id, // Ayran
                branchId: branches[0].id,
                quantity: 80,  // 80 adet
                lowStockThreshold: 40,
                idealStockLevel: 150,
                expirationDate: new Date('2024-02-15')
            }
        ];

        // Stok geçmişi
        const stockHistories = [
            {
                stockId: 1,
                productId: products[0].id,
                restaurantId: restaurant.id,
                quantity: 25,
                type: StockTransactionType.IN,
                notes: 'İlk stok girişi - Domates',
                date: new Date('2024-01-01')
            },
            {
                stockId: 2,
                productId: products[1].id,
                restaurantId: restaurant.id,
                quantity: 15,
                type: StockTransactionType.IN,
                notes: 'İlk stok girişi - Salatalık',
                date: new Date('2024-01-01')
            },
            {
                stockId: 3,
                productId: products[4].id,
                restaurantId: restaurant.id,
                quantity: 120,
                type: StockTransactionType.IN,
                notes: 'İlk stok girişi - Cola',
                date: new Date('2024-01-01')
            },
            {
                stockId: 4,
                productId: products[5].id,
                restaurantId: restaurant.id,
                quantity: 80,
                type: StockTransactionType.IN,
                notes: 'İlk stok girişi - Ayran',
                date: new Date('2024-01-01')
            }
        ];

        // Seed fonksiyonuna ekle
        await prisma.stock.createMany({
            data: stocks
        });

        await prisma.stockHistory.createMany({
            data: stockHistories
        });

        // Tedarikçi ve satın alma siparişleri için seed verileri
        console.log('Creating suppliers...');
        const suppliers = await Promise.all([
            prisma.supplier.create({
                data: {
                    name: "ABC Tedarik Ltd.",
                    restaurantId: restaurant.id,
                    contactName: "Ahmet Yılmaz",
                    phone: "05551234567",
                    email: "abc@tedarik.com"
                }
            }),
            prisma.supplier.create({
                data: {
                    name: "XYZ Gıda San.",
                    restaurantId: restaurant.id,
                    contactName: "Mehmet Demir",
                    phone: "05559876543",
                    email: "xyz@gida.com"
                }
            })
        ]);

        console.log('✅ Suppliers seed data created successfully');

        // Örnek satın alma siparişleri
        console.log('Creating purchase orders...');
        const purchaseOrders = await Promise.all([
            prisma.purchaseOrder.create({
                data: {
                    supplierId: suppliers[0].id,  // İlk tedarikçi
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,
                    expectedDeliveryDate: new Date('2024-03-20T10:00:00Z'),
                    notes: "Acil sipariş",
                    status: "PENDING",
                    totalAmount: 550
                }
            }),
            prisma.purchaseOrder.create({
                data: {
                    supplierId: suppliers[1].id,  // İkinci tedarikçi
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,
                    expectedDeliveryDate: new Date('2024-03-25T10:00:00Z'),
                    notes: "Haftalık sipariş",
                    status: "PENDING",
                    totalAmount: 125
                }
            })
        ]);

        console.log('✅ Purchase orders seed data created successfully');

        // Örnek satın alma sipariş kalemleri
        console.log('Creating purchase order items...');
        const purchaseOrderItems = await Promise.all([
            prisma.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: purchaseOrders[0].id, // İlk siparişe bağlı
                    productId: products[0].id, // Domates
                    quantity: 100,
                    unitPrice: 4.5,
                    totalPrice: 450
                }
            }),
            prisma.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: purchaseOrders[0].id, // İlk siparişe bağlı
                    productId: products[1].id, // Salatalık
                    quantity: 50,
                    unitPrice: 2,
                    totalPrice: 100
                }
            }),
            prisma.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: purchaseOrders[1].id, // İkinci siparişe bağlı
                    productId: products[2].id, // Biber
                    quantity: 25,
                    unitPrice: 5,
                    totalPrice: 125
                }
            })
        ]);

        console.log('✅ Purchase order items seed data created successfully');

        // Önce müşterileri oluştur
        const customer = await prisma.customer.create({
            data: {
                name: "Ahmet Yılmaz",
                phoneNumber: "05321234567",
                email: "ahmet@example.com",
                restaurantId: restaurant.id
            }
        });

        // İkinci müşteri
        await prisma.customer.create({
            data: {
                name: "Ayşe Demir",
                phoneNumber: "05331234567",
                email: "ayse@example.com",
                restaurantId: restaurant.id
            }
        });

        // Sonra rezervasyonu oluştur
        const reservation = await prisma.reservation.create({
            data: {
                customerId: customer.id,
                tableId: tables[0].id,
                restaurantId: restaurant.id,
                reservationTime: new Date('2024-03-20T19:00:00Z'),
                partySize: 4,
                status: 'PENDING',
                notes: 'Pencere kenarı tercih edilir'
            }
        });

        // Hesap oluştur
        const accounts = await Promise.all([
            prisma.account.create({
                data: {
                    accountName: "Ana Kasa",
                    accountType: "REVENUE",
                    restaurant: {
                        connect: { id: restaurant.id }
                    },
                    balance: 1000
                }
            }),
            prisma.account.create({
                data: {
                    accountName: "Banka Hesabı",
                    accountType: "REVENUE",
                    restaurant: {
                        connect: { id: restaurant.id }
                    },
                    balance: 5000
                }
            })
        ]);

        // Örnek sipariş oluştur
        const order = await prisma.order.create({
            data: {
                restaurantId: restaurant.id,
                branchId: branches[0].id,
                tableId: tables[0].id,
                status: 'DELIVERED',
                orderSource: 'IN_STORE',
                orderItems: {
                    create: [
                        {
                            productId: products[0].id,
                            quantity: 1,
                            unitPrice: 150
                        },
                        {
                            productId: products[1].id,
                            quantity: 1,
                            unitPrice: 30
                        }
                    ]
                }
            }
        });

        // Örnek ödeme oluştur
        await prisma.payment.create({
            data: {
                orderId: order.id,
                paymentMethod: "CREDIT_CARD",
                amount: 180,
                cardPayment: {
                    create: {
                        lastFourDigits: "1234",
                        cardType: "VISA",
                        transactionId: "TX" + Date.now()
                    }
                }
            }
        });

        // Ödemeler oluştur
        const payments = await Promise.all([
            prisma.payment.create({
                data: {
                    orderId: 1, // İlk sipariş ID'si
                    paymentMethod: 'CREDIT_CARD',
                    amount: 300,
                    paymentTime: new Date()
                }
            }),
            prisma.payment.create({
                data: {
                    orderId: 2, // İkinci sipariş ID'si
                    paymentMethod: 'CREDIT_CARD',
                    amount: 60,
                    paymentTime: new Date()
                }
            })
        ]);

        // Sonra CardPayment kayıtlarını oluştur
        await Promise.all(
            payments.map(async payment => {
                const existingCardPayment = await prisma.cardPayment.findUnique({
                    where: { paymentId: payment.id }
                });

                if (!existingCardPayment) {
                    return prisma.cardPayment.create({
                        data: {
                            paymentId: payment.id,
                            cardType: 'VISA',
                            lastFourDigits: '1234',
                            transactionId: `tx${payment.id}`
                        }
                    });
                }
                return existingCardPayment;
            })
        );

        // Örnek sipariş oluştur (2 adet köfte için)
        const order2 = await prisma.order.create({
            data: {
                restaurantId: restaurant.id,
                branchId: branches[0].id,
                tableId: tables[0].id,
                waiterId: otherUsers[0].id, // Garson
                status: 'DELIVERED',
                orderSource: 'IN_STORE',
                totalAmount: 300, // 2 köfte x 150 TL
                orderItems: {
                    create: {
                        productId: products[0].id, // Köfte
                        quantity: 2,
                        unitPrice: 150,
                        note: "Az pişmiş"
                    }
                }
            }
        });

        // Örnek ödeme oluştur (2 köfte için)
        await prisma.payment.create({
            data: {
                orderId: order2.id,
                paymentMethod: "CREDIT_CARD",
                amount: 300,
                cardPayment: {
                    create: {
                        lastFourDigits: "5678",
                        cardType: "MASTERCARD",
                        transactionId: "TX" + Date.now()
                    }
                }
            }
        });

        // Raporlama için test verileri
        // Farklı günlerde siparişler oluştur
        const orderDates = [
            new Date('2024-01-01T12:00:00Z'),
            new Date('2024-01-01T19:00:00Z'),
            new Date('2024-01-02T13:00:00Z'),
            new Date('2024-01-02T20:00:00Z'),
            new Date('2024-01-03T14:00:00Z')
        ];

        for (const orderDate of orderDates) {
            const order = await prisma.order.create({
                data: {
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,
                    tableId: tables[0].id,
                    waiterId: otherUsers[0].id, // Garson
                    status: 'DELIVERED',
                    orderSource: 'IN_STORE',
                    totalAmount: 330, // 1 köfte + 2 cola
                    orderTime: orderDate,
                    openingTime: new Date(orderDate.getTime() - 30 * 60000), // 30 dakika önce
                    closingTime: new Date(orderDate.getTime() + 60 * 60000), // 1 saat sonra
                    preparationStartTime: new Date(orderDate.getTime() + 5 * 60000), // 5 dakika sonra
                    preparationEndTime: new Date(orderDate.getTime() + 25 * 60000), // 25 dakika sonra
                    customerCount: 2,
                    orderItems: {
                        create: [
                            {
                                productId: products[0].id, // Köfte
                                quantity: 1,
                                unitPrice: 150,
                                preparationStartTime: new Date(orderDate.getTime() + 5 * 60000),
                                preparationEndTime: new Date(orderDate.getTime() + 25 * 60000)
                            },
                            {
                                productId: products[1].id, // Cola
                                quantity: 2,
                                unitPrice: 30,
                                preparationStartTime: new Date(orderDate.getTime() + 5 * 60000),
                                preparationEndTime: new Date(orderDate.getTime() + 10 * 60000)
                            }
                        ]
                    }
                }
            });

            // Her sipariş için ödeme oluştur
            await prisma.payment.create({
                data: {
                    orderId: order.id,
                    paymentMethod: "CREDIT_CARD",
                    amount: 330,
                    cardPayment: {
                        create: {
                            lastFourDigits: "1234",
                            cardType: "VISA",
                            transactionId: "TX" + Date.now()
                        }
                    }
                }
            });

            // Stok hareketleri oluştur
            await prisma.stockHistory.createMany({
                data: [
                    {
                        stockId: 1,
                        productId: products[0].id,
                        restaurantId: restaurant.id,
                        quantity: -1,
                        type: "OUT",
                        orderId: order.id,
                        date: orderDate
                    },
                    {
                        stockId: 2,
                        productId: products[1].id,
                        restaurantId: restaurant.id,
                        quantity: -2,
                        type: "OUT",
                        orderId: order.id,
                        date: orderDate
                    }
                ]
            });
        }

        // İkinci şube için siparişler
        const branch2OrderDates = [
            new Date('2024-01-01T15:00:00Z'),
            new Date('2024-01-02T16:00:00Z')
        ];

        for (const orderDate of branch2OrderDates) {
            const order = await prisma.order.create({
                data: {
                    restaurantId: restaurant.id,
                    branchId: branches[1].id,
                    tableId: tables[1].id,
                    waiterId: otherUsers[0].id,
                    status: 'DELIVERED',
                    orderSource: 'IN_STORE',
                    totalAmount: 210, // 2 cola + 1 köfte
                    orderTime: orderDate,
                    openingTime: new Date(orderDate.getTime() - 20 * 60000),
                    closingTime: new Date(orderDate.getTime() + 45 * 60000),
                    preparationStartTime: new Date(orderDate.getTime() + 3 * 60000),
                    preparationEndTime: new Date(orderDate.getTime() + 20 * 60000),
                    customerCount: 1,
                    orderItems: {
                        create: [
                            {
                                productId: products[0].id,
                                quantity: 1,
                                unitPrice: 150
                            },
                            {
                                productId: products[1].id,
                                quantity: 2,
                                unitPrice: 30
                            }
                        ]
                    }
                }
            });

            await prisma.payment.create({
                data: {
                    orderId: order.id,
                    paymentMethod: "CASH",
                    amount: 210
                }
            });
        }

        // Personel performans raporu için ek veriler
        const waiterOrders = await Promise.all([
            prisma.order.create({
                data: {
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,
                    tableId: tables[0].id,
                    waiterId: otherUsers[0].id,
                    status: 'DELIVERED',
                    orderSource: 'IN_STORE',
                    totalAmount: 450,
                    orderTime: new Date('2024-01-03T18:00:00Z'),
                    customerCount: 3,
                    orderItems: {
                        create: [
                            {
                                productId: products[0].id,
                                quantity: 3,
                                unitPrice: 150
                            }
                        ]
                    }
                }
            }),
            prisma.order.create({
                data: {
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,
                    tableId: tables[1].id,
                    waiterId: otherUsers[0].id,
                    status: 'DELIVERED',
                    orderSource: 'IN_STORE',
                    totalAmount: 90,
                    orderTime: new Date('2024-01-03T19:00:00Z'),
                    customerCount: 2,
                    orderItems: {
                        create: [
                            {
                                productId: products[1].id,
                                quantity: 3,
                                unitPrice: 30
                            }
                        ]
                    }
                }
            })
        ]);

        // Garson siparişleri için ödemeler
        await Promise.all(waiterOrders.map(order =>
            prisma.payment.create({
                data: {
                    orderId: order.id,
                    paymentMethod: "CREDIT_CARD",
                    amount: order.totalAmount,
                    cardPayment: {
                        create: {
                            lastFourDigits: "9999",
                            cardType: "MASTERCARD",
                            transactionId: "TX" + Date.now()
                        }
                    }
                }
            })
        ));

        // Yazıcıları oluştur
        const printers = await Promise.all([
            // Ana şube mutfak yazıcısı
            prisma.printer.create({
                data: {
                    name: "Mutfak Yazıcısı",
                    type: "KITCHEN",
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,  // Ana şube
                    ipAddress: "192.168.1.100",
                    port: 9100,
                    isActive: true,
                    isDefault: true
                }
            }),
            // Ana şube kasa yazıcısı
            prisma.printer.create({
                data: {
                    name: "Kasa Yazıcısı",
                    type: "CASHIER",
                    restaurantId: restaurant.id,
                    branchId: branches[0].id,  // Ana şube
                    ipAddress: "192.168.1.101",
                    port: 9100,
                    isActive: true,
                    isDefault: false
                }
            }),
            // İkinci şube mutfak yazıcısı
            prisma.printer.create({
                data: {
                    name: "İkinci Şube Mutfak",
                    type: "KITCHEN",
                    restaurantId: restaurant.id,
                    branchId: branches[1].id,  // İkinci şube
                    ipAddress: "192.168.1.102",
                    port: 9100,
                    isActive: true,
                    isDefault: true
                }
            }),
            // İkinci şube kasa yazıcısı
            prisma.printer.create({
                data: {
                    name: "İkinci Şube Kasa",
                    type: "CASHIER",
                    restaurantId: restaurant.id,
                    branchId: branches[1].id,  // İkinci şube
                    ipAddress: "192.168.1.103",
                    port: 9100,
                    isActive: true,
                    isDefault: false
                }
            })
        ]);

        console.log('✅ Printer seed data created successfully');

        // Temel izinleri oluştur
        const permissions = await Promise.all([
            prisma.permission.create({
                data: {
                    name: "VIEW_PERMISSIONS",
                    description: "İzinleri görüntüleme yetkisi"
                }
            }),
            prisma.permission.create({
                data: {
                    name: "MANAGE_PERMISSIONS",
                    description: "İzin yönetimi yetkisi"
                }
            })
        ]);

        // Admin kullanıcısına izinleri ata
        await prisma.userPermissions.create({
            data: {
                userId: adminUser.id,  // Admin kullanıcısı
                permissions: {
                    connect: permissions.map(p => ({ id: p.id }))
                }
            }
        });

        console.log('✅ Permission seed data created successfully');

        // Reçete ve malzeme verileri
        const recipes = await Promise.all([
            // Köfte Porsiyon reçetesi
            prisma.recipe.create({
                data: {
                    productId: products[2].id, // Köfte Porsiyon
                    ingredients: {
                        create: [
                            {
                                name: "Dana Kıyma",
                                quantity: 150,
                                unit: "gram",
                                cost: 45.0,
                                waste: 5
                            },
                            {
                                name: "Soğan",
                                quantity: 30,
                                unit: "gram",
                                cost: 2.5,
                                waste: 10
                            },
                            {
                                name: "Baharatlar",
                                quantity: 10,
                                unit: "gram",
                                cost: 5.0,
                                waste: 0
                            }
                        ]
                    }
                }
            }),
            // Tavuk Şiş reçetesi
            prisma.recipe.create({
                data: {
                    productId: products[3].id, // Tavuk Şiş
                    ingredients: {
                        create: [
                            {
                                name: "Tavuk Göğüs",
                                quantity: 180,
                                unit: "gram",
                                cost: 35.0,
                                waste: 8
                            },
                            {
                                name: "Biber",
                                quantity: 50,
                                unit: "gram",
                                cost: 3.0,
                                waste: 15
                            },
                            {
                                name: "Domates",
                                quantity: 50,
                                unit: "gram",
                                cost: 2.0,
                                waste: 15
                            },
                            {
                                name: "Marine Sosu",
                                quantity: 30,
                                unit: "ml",
                                cost: 8.0,
                                waste: 5
                            }
                        ]
                    }
                }
            })
        ]);

        console.log('✅ Recipe seed data created successfully');

        // Order Items için test verileri
        const orderItems = await Promise.all([
            prisma.orderItem.create({
                data: {
                    orderId: 1,
                    productId: 1,
                    quantity: 2,
                    unitPrice: 42.00,
                    type: 'SALE',
                    orderItemStatus: 'PENDING',
                    selectedOptions: {
                        connect: [{ id: 1 }, { id: 2 }]
                    }
                }
            }),
            prisma.orderItem.create({
                data: {
                    orderId: 1,
                    productId: 2,
                    quantity: 1,
                    unitPrice: 35.00,
                    type: 'SALE',
                    orderItemStatus: 'PREPARING',
                    selectedOptions: {
                        connect: [{ id: 3 }]
                    }
                }
            }),
            // İptal edilmiş sipariş kalemi örneği
            prisma.orderItem.create({
                data: {
                    orderId: 1,
                    productId: products[0].id,
                    quantity: 1,
                    unitPrice: 28.00,
                    type: 'VOID',
                    isVoid: true,
                    orderItemStatus: 'PENDING',
                    selectedOptions: {
                        connect: [{ id: 4 }]
                    }
                }
            })
        ]);

        console.log('✅ Order Items seed data created successfully');

        // Örnek reçete içerikleri
        console.log('Creating recipe ingredients...');
        const recipeIngredients = await Promise.all([
            // Tavuk Döner reçetesi için malzemeler
            prisma.recipeIngredient.create({
                data: {
                    recipeId: recipes[0].id,
                    name: "Tavuk Göğsü",
                    quantity: 200,
                    unit: "gram",
                    cost: 25.00,
                    waste: 5
                }
            }),
            prisma.recipeIngredient.create({
                data: {
                    recipeId: recipes[0].id,
                    name: "Özel Sos",
                    quantity: 50,
                    unit: "ml",
                    cost: 5.00,
                    waste: 2
                }
            }),
            // Et Döner reçetesi için malzemeler
            prisma.recipeIngredient.create({
                data: {
                    recipeId: recipes[1].id,
                    name: "Dana Eti",
                    quantity: 250,
                    unit: "gram",
                    cost: 45.00,
                    waste: 8
                }
            }),
            prisma.recipeIngredient.create({
                data: {
                    recipeId: recipes[1].id,
                    name: "Baharat Karışımı",
                    quantity: 10,
                    unit: "gram",
                    cost: 3.00,
                    waste: 0
                }
            })
        ]);

        console.log('✅ Recipe ingredients seed data created successfully');

        // Örnek fiyat geçmişi
        console.log('Creating price history...');
        const priceHistory = await Promise.all([
            prisma.priceHistory.create({
                data: {
                    productId: 1,
                    oldPrice: 40,
                    newPrice: 45,
                    startDate: new Date('2023-10-26T00:00:00Z'),
                    endDate: new Date('2023-11-15T00:00:00Z')
                }
            }),
            prisma.priceHistory.create({
                data: {
                    productId: 2,
                    oldPrice: 10,
                    newPrice: 15,
                    startDate: new Date('2023-11-25T00:00:00Z'),
                    endDate: null
                }
            })
        ]);

        console.log('✅ Price history seed data created successfully');

        // Örnek ürün-tedarikçi ilişkileri
        console.log('Creating product supplier relations...');
        const productSuppliers = await Promise.all([
            prisma.productSupplier.create({
                data: {
                    productId: 1,
                    supplierId: 1,
                    isPrimary: true,
                    lastPurchasePrice: 4.5,
                    supplierProductCode: "DMT-001"
                }
            }),
            prisma.productSupplier.create({
                data: {
                    productId: 2,
                    supplierId: 2,
                    isPrimary: false,
                    lastPurchasePrice: 2.5,
                    supplierProductCode: "SLT-002"
                }
            })
        ]);

        console.log('✅ Product supplier relations seed data created successfully');

        // Örnek restoran ayarları
        console.log('Creating restaurant settings...');
        const settings = await Promise.all([
            prisma.settings.create({
                data: {
                    restaurantId: restaurant.id,  // İlk restoran için
                    appName: "Restoran Yönetim Sistemi",
                    appLogoUrl: null,
                    currency: "TL",
                    timezone: "Europe/Istanbul",
                    dailyCloseTime: "03:00",
                    workingHours: "08:00-00:00"
                }
            })
        ]);

        console.log('✅ Restaurant settings seed data created successfully');

        console.log('✅ Seed data created successfully');
        console.log('Test credentials:');
        console.log('Admin: test@example.com / 123456');
        console.log('Kitchen: kitchen@example.com / 123456');
        console.log('Bar: bar@example.com / 123456');
        console.log('Waiter: waiter@example.com / 123456');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 