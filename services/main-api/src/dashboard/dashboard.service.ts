import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    // Get various statistics for the dashboard
    const [
      postsCount,
      subscriptionsCount,
      monthlySubscriptionTotal,
      mediaCount,
      snippetsCount,
      articlesCount,
      unreadArticlesCount,
    ] = await Promise.all([
      this.prisma.post.count({ where: { authorId: userId } }),
      this.prisma.subscription.count({ where: { userId, isActive: true } }),
      this.getMonthlySubscriptionTotal(userId),
      this.prisma.mediaItem.count({ where: { userId } }),
      this.prisma.codeSnippet.count({ where: { userId } }),
      this.prisma.article.count({ where: { userId } }),
      this.prisma.article.count({ where: { userId, isRead: false } }),
    ]);

    return {
      posts: postsCount,
      subscriptions: subscriptionsCount,
      monthlySubscriptionTotal,
      media: mediaCount,
      snippets: snippetsCount,
      articles: articlesCount,
      unreadArticles: unreadArticlesCount,
    };
  }

  private async getMonthlySubscriptionTotal(userId: string): Promise<number> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId, isActive: true },
    });

    return subscriptions.reduce((total, sub) => {
      const monthlyAmount =
        sub.billingCycle === 'MONTHLY' ? sub.amount : sub.amount / 12;
      return total + monthlyAmount;
    }, 0);
  }

  async getRecentActivity(userId: string) {
    const [recentPosts, recentMedia, recentSnippets] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          isDraft: true,
        },
      }),
      this.prisma.mediaItem.findMany({
        where: { userId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          updatedAt: true,
        },
      }),
      this.prisma.codeSnippet.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          language: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      recentPosts,
      recentMedia,
      recentSnippets,
    };
  }
}
