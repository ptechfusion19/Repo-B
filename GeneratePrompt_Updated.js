// Build AI Prompt - SEO Performance Report (Date Range Period)
const data = $input.first().json;

// Extract data
const domainRank = data.domainRank?.domainRank || {};
const keywords = data.keywords?.keywords || {};
const backlinks = data.backlinks?.backlinks || {};
const onPage = data.onPage?.onPage || {};
const metadata = data.metadata || {};

// Get date range from metadata
const dateFrom = metadata.dateFrom || 'N/A';
const dateTo = metadata.dateTo || 'N/A';

// Format date range for display
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

const formattedDateFrom = formatDate(dateFrom);
const formattedDateTo = formatDate(dateTo);
const reportPeriod = `${formattedDateFrom} - ${formattedDateTo}`;

// Format keywords lists
const formatKeywords = (kwList, limit = 10) => {
  if (!kwList || kwList.length === 0) return '*No keywords in this category*';
  return kwList.slice(0, limit).map((kw, i) => 
    `${i + 1}. **${kw.keyword}** (Rank: ${kw.rank}, Volume: ${kw.searchVolume}/mo, CPC: £${kw.cpc})`
  ).join('\n');
};

// Calculate traffic trend
const trafficChange = domainRank.periodChanges?.trafficValueChange || 0;
const trafficStart = domainRank.periodChanges?.trafficStart || 0;
const trafficTrend = trafficStart > 0 ? Math.round((trafficChange / trafficStart) * 100) : 0;
const trafficTrendStr = trafficTrend >= 0 ? `+${trafficTrend}%` : `${trafficTrend}%`;

// Calculate keyword trend
const keywordChange = domainRank.periodChanges?.keywordsChange || 0;
const keywordStart = domainRank.periodChanges?.keywordsStart || 0;
const keywordTrend = keywordStart > 0 ? Math.round((keywordChange / keywordStart) * 100) : 0;
const keywordTrendStr = keywordTrend >= 0 ? `+${keywordTrend}%` : `${keywordTrend}%`;

// Calculate backlinks trend
const backlinksChange = backlinks.periodChanges?.backlinksChange || 0;
const backlinksStart = backlinks.periodChanges?.backlinksStart || 0;
const backlinksTrend = backlinksStart > 0 ? Math.round((backlinksChange / backlinksStart) * 100) : 0;
const backlinksTrendStr = backlinksTrend >= 0 ? `+${backlinksTrend}%` : `${backlinksTrend}%`;

// Calculate referring domains trend
const domainsChange = backlinks.periodChanges?.domainsChange || 0;
const domainsStart = backlinks.periodChanges?.domainsStart || 0;
const domainsTrend = domainsStart > 0 ? Math.round((domainsChange / domainsStart) * 100) : 0;
const domainsTrendStr = domainsTrend >= 0 ? `+${domainsTrend}%` : `${domainsTrend}%`;

// Determine site health status
const criticalIssues = onPage.issues?.critical || 0;
const warnings = onPage.issues?.warnings || 0;
const healthScore = Math.max(0, 100 - (criticalIssues * 5) - (warnings * 2));
const healthStatus = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good / Technical Maintenance Required' : 'Needs Attention / Technical Issues';

// Calculate intent distribution (estimate from keyword data)
const allKeywords = keywords.allKeywords || [];
const totalKw = allKeywords.length || 1;
const informationalKw = allKeywords.filter(k => k.intent === 'informational').length;
const commercialKw = allKeywords.filter(k => k.intent === 'commercial').length;
const navigationalKw = allKeywords.filter(k => k.intent === 'navigational').length;
const transactionalKw = allKeywords.filter(k => k.intent === 'transactional').length;

const informationalPercent = Math.round((informationalKw / totalKw) * 100) || 0;
const commercialPercent = Math.round((commercialKw / totalKw) * 100) || 0;
const navigationalPercent = Math.round((navigationalKw / totalKw) * 100) || 0;
const transactionalPercent = Math.round((transactionalKw / totalKw) * 100) || 0;

const systemPrompt = `You are a Senior UK SEO Analyst specialising in performance reporting and data-driven insights.

Your expertise includes:
- Performance tracking and trend analysis across specific date ranges
- Technical SEO health monitoring
- Keyword ranking analysis and movement tracking
- Backlink profile assessment
- Actionable strategic recommendations

Communication Style:
- Professional, concise, and data-focused
- Clear metric-driven insights with trend indicators
- Strategic and forward-thinking
- Focused on period gains and areas needing attention
- Direct and actionable recommendations

Report Format Requirements:
- Use UK English spelling throughout (optimisation, colour, analyse, etc.)
- Use clean, scannable tables for metrics
- Use clear section headings with numbers
- Include trend indicators (↑ ↓ →) where appropriate
- Use **bold** for key metrics and findings
- Keep language professional but accessible
- Focus on actionable insights, not fluff
- Use £ for currency values`;

const userPrompt = `# SEO Performance Report: ${domainRank.target || 'Unknown Website'}

**Reporting Period:** ${reportPeriod}

Generate a professional SEO Performance Report based on the data below. Follow the EXACT structure provided.

---

## RAW DATA FOR ANALYSIS

### Authority & Traffic Data
- Target Domain: ${domainRank.target || 'N/A'}
- Estimated Traffic Value: £${domainRank.estimatedTrafficValue || 0}
- Total Ranking Keywords: ${domainRank.totalKeywords || 0}
- Keywords Start of Period: ${domainRank.periodChanges?.keywordsStart || 0}
- Keywords End of Period: ${domainRank.periodChanges?.keywordsEnd || 0}
- Traffic Value Start: £${domainRank.periodChanges?.trafficStart || 0}
- Traffic Value End: £${domainRank.periodChanges?.trafficEnd || 0}

### Position Distribution
- Top 3 Positions: ${domainRank.positions?.top3 || 0}
- Top 10 Positions: ${domainRank.positions?.top10 || 0}
- Page 2 (11-20): ${domainRank.positions?.page2 || 0}
- Page 3 (21-30): ${domainRank.positions?.page3 || 0}
- Page 4+ (31+): ${domainRank.positions?.page4Plus || 0}

### Keyword Movement (During Period)
- New Keywords: +${domainRank.movement?.newKeywords || 0}
- Improved Positions: +${domainRank.movement?.improved || 0}
- Declined Positions: -${domainRank.movement?.declined || 0}
- Lost Keywords: -${domainRank.movement?.lost || 0}

### Keyword Analysis
- Total Keywords: ${keywords.summary?.totalKeywords || 0}
- Total Search Volume: ${keywords.summary?.totalSearchVolume || 0}/month
- Branded Keywords: ${keywords.summary?.brandedCount || 0} (${keywords.summary?.brandedPercent || 0}%)
- Unbranded Keywords: ${keywords.summary?.unbrandedCount || 0} (${keywords.summary?.unbrandedPercent || 0}%)

### Search Intent Distribution
- Informational: ${informationalKw} keywords (${informationalPercent}%)
- Commercial: ${commercialKw} keywords (${commercialPercent}%)
- Navigational: ${navigationalKw} keywords (${navigationalPercent}%)
- Transactional: ${transactionalKw} keywords (${transactionalPercent}%)

### Top Performing Keywords
${formatKeywords(keywords.topPerformers, 10)}

### Page 2 Opportunities
${formatKeywords(keywords.quickWinOpportunities, 10)}

### Backlink Profile
- Total Backlinks: ${backlinks.totalBacklinks || 0}
- Referring Domains: ${backlinks.referringDomains || 0}
- Domain Rank: ${backlinks.rank || 0}
- Backlinks Start of Period: ${backlinks.periodChanges?.backlinksStart || 0}
- Backlinks End of Period: ${backlinks.periodChanges?.backlinksEnd || 0}
- Domains Start: ${backlinks.periodChanges?.domainsStart || 0}
- Domains End: ${backlinks.periodChanges?.domainsEnd || 0}

### Technical SEO (OnPage)
- Site Health Score: ${healthScore}%
- Pages Crawled: ${onPage.pagesCrawled || 0}
- Critical Issues (Errors): ${onPage.issues?.critical || 0}
- Warnings: ${onPage.issues?.warnings || 0}
- Notices: ${onPage.issues?.notices || 0}
- Broken Links: ${onPage.pageMetrics?.brokenLinks || 0}
- Broken Resources: ${onPage.pageMetrics?.brokenResources || 0}
- Duplicate Titles: ${onPage.pageMetrics?.duplicateTitle || 0}
- Duplicate Descriptions: ${onPage.pageMetrics?.duplicateDescription || 0}
- Duplicate Content: ${onPage.pageMetrics?.duplicateContent || 0}

### Calculated Trends (Period Change)
- Traffic Trend: ${trafficTrendStr}
- Keyword Trend: ${keywordTrendStr}
- Backlinks Trend: ${backlinksTrendStr}
- Referring Domains Trend: ${domainsTrendStr}

---

## REQUIRED REPORT STRUCTURE

Generate the report with this EXACT structure:

### 1. Executive Summary
Write 2-3 sentences summarising:
- Current organic performance status (traffic value, total keywords)
- Domain's strongest ranking positions
- Any critical technical issues requiring attention
- Overall status assessment (e.g., "High Visibility / Technical Maintenance Required")

### 2. Domain & Traffic Overview
Create a **table** with these metrics:

| Metric | Value | Period Trend |
|--------|-------|--------------|
| Authority Score | [value] | [Stable/↑/↓] |
| Organic Search Traffic | [value] | [+X%/-X%] |
| Organic Keywords | [value] | [+X%/-X%] |
| Referring Domains | [value] | [+X%/-X%] |
| Total Backlinks | [value] | [+X%/-X%] |

**Search Intent Profile**
Describe the intent distribution:
- **Informational (X%):** Brief description of what these keywords represent
- **Commercial (X%):** Brief description
- **Navigational (X%):** Brief description
- **Transactional (X%):** Brief description (if applicable)

### 3. Organic Keyword Performance
Analyse the keyword performance:
- **Primary Rankings:** Highlight top ranking keywords (positions 1-3)
- **Traffic Drivers:** Identify the keywords driving most traffic
- **Position Distribution:** Summarise how keywords are distributed across positions
- Note any significant ranking changes or movements during the period

### 4. Technical SEO Health
Report the Site Health Score and status.

**Critical Issues (Errors)**
List any critical issues found:
- Structured data problems
- Duplicate content issues
- 4xx/5xx errors
- Broken links/resources

**Performance & Optimisation**
- Core Web Vitals status assessment
- Page speed observations
- Mobile optimisation status

### 5. Backlink Profile Analysis
Analyse the backlink profile:
- **Link Attributes:** Follow vs nofollow ratio assessment
- **Profile Trend:** Whether links are growing or declining during the period
- **Quality Assessment:** Brief assessment of link quality based on domain rank

### 6. Summary of Period Gains
List 3-5 bullet points of positive achievements during this period:
- Traffic growth percentage
- New keywords gained
- Position improvements
- Any other wins

### 7. Strategic Recommendations
Provide 3-5 prioritised action items based on the data:
- Most critical technical fixes needed
- Keyword opportunities to pursue
- Content recommendations
- Link building suggestions (if applicable)

---

## IMPORTANT FORMATTING RULES:
1. Use clean, professional UK English (optimisation, analyse, colour, etc.)
2. Use tables where specified
3. Use **bold** for key metrics
4. Keep each section concise and scannable
5. Focus on data-driven insights, not generic advice
6. Use trend indicators (↑ increasing, ↓ decreasing, → stable)
7. Be specific with numbers from the data provided
8. Keep the report practical and actionable
9. Reference the specific reporting period, not "monthly"

Generate the complete SEO Performance Report now.`;

return {
  systemPrompt: systemPrompt,
  userPrompt: userPrompt,
  targetWebsite: domainRank.target || 'Unknown',
  dateFrom: dateFrom,
  dateTo: dateTo,
  reportPeriod: reportPeriod,
  generatedAt: new Date().toISOString()
};
