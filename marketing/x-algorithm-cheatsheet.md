# X Algorithm Cheat Sheet — Quick Reference

## Engagement Weights (What the Algorithm Actually Counts)

| Action | Weight | vs. 1 Like |
|---|---|---|
| Author replies to a reply on their tweet | **+75** | **150x** |
| Someone replies to your tweet | **+27** | **54x** |
| Profile click + engagement | **+12** | **24x** |
| Conversation click + stay >2 min | **+11** | **22x** |
| Bookmark | **+10** | **20x** |
| Retweet | **+1** | **2x** |
| Like | **+0.5** | **baseline** |
| Block/Mute/"Show less" | **-74** | **-148x** |
| Report | **-369** | **-738x** |

**Translation:** ONE reply where you engage back = 150 likes. ONE report = destroys 738 likes of signal.

## What Kills Your Reach

| Factor | Penalty |
|---|---|
| External links in main tweet | -30 to 50% reach |
| 3+ hashtags | -40% reach |
| Negative/combative tone (Grok detects) | Suppressed distribution |
| Reports or blocks | -74 to -369 per incident |
| Posting back-to-back | Cannibalizes your own reach |
| Low engagement rate on first 100 tweets | Cold start suppression (10% of normal reach) |

## What Boosts Your Reach

| Factor | Boost |
|---|---|
| X Premium | 4x in-network, 2x out-of-network |
| Images/video attached | 2x in Earlybird ranker |
| Positive/constructive tone | Wider distribution (Grok sentiment) |
| Author engaging with replies | +75 weight per reply chain |
| High bookmark rate | +10 weight each, signals save-worthy content |
| Diverse engagement (many different users) | Better distribution |

## Optimal Posting

- **Best time:** Wednesday 9 AM ET
- **Good times:** Tue-Thu 8-10 AM ET
- **Worst times:** Weekends
- **Tweet half-life:** 6 hours (relevancy drops 50% every 6 hrs)
- **Optimal thread length:** 5-7 tweets
- **Max hashtags:** 2 (in final tweet only)
- **Wait between posts:** 30-60 min minimum

## The First-Hour Rule

The first 30 minutes determine whether your tweet reaches 500 or 500,000 people.

1. Warm up 15-30 min before (engage with others)
2. Post during peak hours
3. Self-reply with links within 10 seconds
4. Reply to EVERY comment within 15 minutes
5. Do NOT post anything else for 2-3 hours
6. Ask follow-up questions in your replies

## Content Format Performance on X

| Format | Performance |
|---|---|
| Text-only | Best (X is the only platform where text beats video) |
| Video | -30% vs text |
| Images | -37% vs text |
| Links | -53% vs text |
| Retweets | -113% vs text |

## Hook Templates That Work

1. "What happens when [provocative scenario]?"
2. "Unpopular opinion: [contrarian take]"
3. "I built [specific thing]. Here's [the twist]:"
4. "I [achieved result with specific numbers] in [timeframe]."
5. "[Topic] is not about [common belief]. It's about [actual truth]."

## The 70/30 Rule

Aim for ~70% agreement, ~30% disagreement. This generates maximum replies (27x weight each) without triggering blocks (-74x weight each).

## Sources

- Twitter open-source algorithm (github.com/twitter/the-algorithm, March 2023)
- xAI open-source X algorithm (github.com/xai-org/x-algorithm, January 2026)
- Buffer analysis of 1M+ tweets
- Elon Musk public statements on algorithm
- TweetHunter, Sprout Social, Hootsuite research
