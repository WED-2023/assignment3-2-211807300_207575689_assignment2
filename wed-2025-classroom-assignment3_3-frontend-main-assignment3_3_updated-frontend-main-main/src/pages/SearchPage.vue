<template>
  <div class="search-page">
    <div class="search-header">
      <h1>🔍 חיפוש מתכונים</h1>
      <p>מצא את המתכון המושלם עבורך</p>
    </div>

    <div class="search-form-container">
      <form @submit.prevent="searchRecipes" class="search-form">
        <!-- Recipe Name/Query -->
        <div class="form-group">
          <label>שם המתכון או מילת מפתח:</label>
          <input 
            v-model="searchParams.query" 
            type="text" 
            class="form-control" 
            placeholder="לדוגמה: לזניה, עוגת שוקולד..."
            required
          />
        </div>

        <div class="form-row">
          <!-- Cuisine -->
          <div class="form-group">
            <label>סוג מטבח:</label>
            <select v-model="searchParams.cuisine" class="form-control">
              <option value="">כל סוגי המטבח</option>
              <option v-for="cuisine in cuisines" :key="cuisine.value" :value="cuisine.value">
                {{ cuisine.label }}
              </option>
            </select>
          </div>

          <!-- Diet -->
          <div class="form-group">
            <label>סוג דיאטה:</label>
            <select v-model="searchParams.diet" class="form-control">
              <option value="">ללא הגבלה</option>
              <option v-for="diet in diets" :key="diet.value" :value="diet.value">
                {{ diet.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <!-- Intolerance -->
          <div class="form-group">
            <label>אלרגיות ואי סבילות:</label>
            <select v-model="searchParams.intolerance" class="form-control">
              <option value="">ללא הגבלה</option>
              <option v-for="intolerance in intolerances" :key="intolerance.value" :value="intolerance.value">
                {{ intolerance.label }}
              </option>
            </select>
          </div>

          <!-- Sort By -->
          <div class="form-group">
            <label>מיון לפי:</label>
            <select v-model="searchParams.sortBy" class="form-control" @change="updateSearchResults">
              <option value="">ברירת מחדל</option>
              <option value="duration">זמן הכנה</option>
              <option value="popularity">פופולריות</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <!-- Limit -->
          <div class="form-group">
            <label>מספר תוצאות:</label>
            <select v-model="searchParams.limit" class="form-control">
              <option value="5">5 מתכונים</option>
              <option value="10">10 מתכונים</option>
              <option value="15">15 מתכונים</option>
            </select>
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary search-btn" :disabled="isLoading">
              <span v-if="isLoading">מחפש...</span>
              <span v-else>🔍 חפש מתכונים</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>מחפש מתכונים מדהימים עבורך...</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <div class="alert alert-danger">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Results using RecipePreviewList -->
    <div v-if="searchResults.length > 0 && !isLoading" class="results-section">
      <RecipePreviewList 
        :title="getResultsTitle()"
        :recipes="searchResults"
        class="search-results"
      />
    </div>

    <!-- No Results -->
    <div v-if="searchResults.length === 0 && hasSearched && !isLoading" class="no-results">
      <h3>😔 לא נמצאו תוצאות</h3>
      <p>נסה לשנות את תנאי החיפוש או להרחיב את הקריטריונים</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { reactive, ref, onMounted, computed } from 'vue';
import RecipePreviewList from '@/components/RecipePreviewList.vue';

export default {
  name: 'SearchPage',
  components: {
    RecipePreviewList
  },
  setup() {
    const searchParams = reactive({
      query: '',
      cuisine: '',
      diet: '',
      intolerance: '',
      sortBy: '',
      limit: '5'
    });

    const searchResults = ref([]);
    const rawSearchResults = ref([]); // שמירת התוצאות המקוריות
    const isLoading = ref(false);
    const errorMessage = ref('');
    const hasSearched = ref(false);

    const cuisines = ref([
      { value: 'African', label: 'אפריקני' },
      { value: 'Asian', label: 'אסייתי' },
      { value: 'American', label: 'אמריקאי' },
      { value: 'British', label: 'בריטי' },
      { value: 'Cajun', label: 'קיג\'ון' },
      { value: 'Caribbean', label: 'קריבי' },
      { value: 'Chinese', label: 'סיני' },
      { value: 'Eastern European', label: 'מזרח אירופי' },
      { value: 'European', label: 'אירופי' },
      { value: 'French', label: 'צרפתי' },
      { value: 'German', label: 'גרמני' },
      { value: 'Greek', label: 'יווני' },
      { value: 'Indian', label: 'הודי' },
      { value: 'Irish', label: 'אירי' },
      { value: 'Italian', label: 'איטלקי' },
      { value: 'Japanese', label: 'יפני' },
      { value: 'Jewish', label: 'יהודי' },
      { value: 'Korean', label: 'קוריאני' },
      { value: 'Latin American', label: 'דרום אמריקני' },
      { value: 'Mediterranean', label: 'ים תיכוני' },
      { value: 'Mexican', label: 'מקסיקני' },
      { value: 'Middle Eastern', label: 'מזרח תיכוני' },
      { value: 'Nordic', label: 'נורדי' },
      { value: 'Southern', label: 'דרומי' },
      { value: 'Spanish', label: 'ספרדי' },
      { value: 'Thai', label: 'תאילנדי' },
      { value: 'Vietnamese', label: 'וייטנאמי' }
    ]);

    const diets = ref([
      { value: 'Gluten Free', label: 'ללא גלוטן' },
      { value: 'Ketogenic', label: 'קטוגני' },
      { value: 'Vegetarian', label: 'צמחוני' },
      { value: 'Lacto-Vegetarian', label: 'צמחוני-חלבי' },
      { value: 'Ovo-Vegetarian', label: 'צמחוני-ביצים' },
      { value: 'Vegan', label: 'טבעוני' },
      { value: 'Pescetarian', label: 'פסקטריאן' },
      { value: 'Paleo', label: 'פליאו' },
      { value: 'Primal', label: 'פרימל' },
      { value: 'Low FODMAP', label: 'Low FODMAP' },
      { value: 'Whole30', label: 'Whole30' }
    ]);

    const intolerances = ref([
      { value: 'Dairy', label: 'חלב' },
      { value: 'Egg', label: 'ביצים' },
      { value: 'Gluten', label: 'גלוטן' },
      { value: 'Grain', label: 'דגנים' },
      { value: 'Peanut', label: 'בוטנים' },
      { value: 'Seafood', label: 'מאכלי ים' },
      { value: 'Sesame', label: 'שומשום' },
      { value: 'Shellfish', label: 'פירות ים' },
      { value: 'Soy', label: 'סויה' },
      { value: 'Sulfite', label: 'סולפיט' },
      { value: 'Tree Nut', label: 'אגוזי עץ' },
      { value: 'Wheat', label: 'חיטה' }
    ]);

    // מיון התוצאות לפי הבחירה
    const sortedResults = computed(() => {
      if (!rawSearchResults.value.length) return [];
      
      const results = [...rawSearchResults.value];
      
      switch (searchParams.sortBy) {
        case 'duration':
          return results.sort((a, b) => {
            const durationA = a.duration || a.readyInMinutes || 0;
            const durationB = b.duration || b.readyInMinutes || 0;
            return durationA - durationB; // מהמהיר לאיטי
          });
          
        case 'popularity':
          return results.sort((a, b) => {
            const popularityA = a.likes || a.aggregateLikes || 0;
            const popularityB = b.likes || b.aggregateLikes || 0;
            return popularityB - popularityA; // מהפופולרי לפחות פופולרי
          });
          
        default:
          return results; // ברירת מחדל - ללא מיון
      }
    });

    // עדכון searchResults כאשר המיון משתנה
    const updateSearchResults = () => {
      searchResults.value = sortedResults.value;
    };
    // שמירה וטעינה של החיפוש האחרון
    const saveLastSearch = () => {
      if (hasSearched.value && rawSearchResults.value.length > 0) {
        const lastSearch = {
          params: { ...searchParams },
          results: rawSearchResults.value,
          timestamp: Date.now()
        };
        sessionStorage.setItem('lastRecipeSearch', JSON.stringify(lastSearch));
      }
    };

    const loadLastSearch = () => {
      const saved = sessionStorage.getItem('lastRecipeSearch');
      if (saved) {
        try {
          const lastSearch = JSON.parse(saved);
          // טעינת החיפוש האחרון רק אם הוא מהיום האחרון
          const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
          if (lastSearch.timestamp > dayAgo) {
            Object.assign(searchParams, lastSearch.params);
            rawSearchResults.value = lastSearch.results;
            updateSearchResults();
            hasSearched.value = true;
          }
        } catch (error) {
          console.error('Error loading last search:', error);
        }
      }
    };

    const buildSearchURL = () => {
      const params = new URLSearchParams();
      
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] && searchParams[key].trim()) {
          params.append(key, searchParams[key].trim());
        }
      });
      
      return `/recipes/search?${params.toString()}`;
    };

    const searchRecipes = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      hasSearched.value = true;
      
      try {
        const url = buildSearchURL();
        console.log('Searching with URL:', url);
        
        const response = await axios.get(url);
        rawSearchResults.value = response.data || [];
        updateSearchResults();
        
        // שמירת החיפוש האחרון
        saveLastSearch();
        
        console.log('Search results:', searchResults.value);
      } catch (error) {
        console.error('Search error:', error);
        
        if (error.response?.status === 404) {
          errorMessage.value = 'לא נמצאו מתכונים התואמים לחיפוש שלך';
        } else if (error.response?.status >= 500) {
          errorMessage.value = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר';
        } else {
          errorMessage.value = 'אירעה שגיאה בחיפוש. אנא נסה שוב';
        }
        
        rawSearchResults.value = [];
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const getResultsTitle = () => {
      const count = searchResults.value.length;
      return `נמצאו ${count} מתכונים`;
    };

    // טעינת החיפוש האחרון בעת טעינת הקומפוננטה
    onMounted(() => {
      loadLastSearch();
    });

    return {
      searchParams,
      searchResults,
      isLoading,
      errorMessage,
      hasSearched,
      cuisines,
      diets,
      intolerances,
      searchRecipes,
      getResultsTitle,
      updateSearchResults
    };
  }
};
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.search-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.search-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.search-form-container {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.9rem;
}

.form-control {
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-bottom: 20px;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-danger {
  background-color: #ffe6e6;
  color: #cc0000;
  border: 1px solid #ffcccc;
}

.results-section {
  margin-top: 30px;
}

.search-results {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #999;
}

@media (max-width: 768px) {
  .search-header h1 {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .search-form-container {
    padding: 20px;
  }
}
</style>