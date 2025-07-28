const router = require('express').Router();
const UserModel = require("../models/NewProfile"); 

router.get("/IndivisualDataFetching", async (req, res) => {
  const { query, field } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const trimmed = query.trim();
  const cleanedQuery = trimmed.replace(/[-.() ]/g, '');
  if (!/^\d+$/.test(cleanedQuery) && !field) {
    return res.status(400).json({ message: "Invalid query format for numeric search without field" });
  }

  const isNumber = /^\d+$/.test(cleanedQuery);

  let searchFields = [];
  if (isNumber) {
    if (cleanedQuery.length >= 5 && cleanedQuery.length <= 6) {
      searchFields = field ? [field] : ['regCode', 'zipcode'];
    } else if (cleanedQuery.length > 6) {
      searchFields = field ? [field] : ['zipcode', 'phoneNumber'];
    } else {
      searchFields = field ? [field] : ['zipcode'];
    }
  } else {
    searchFields = field ? [field] : ['name', 'organization', 'city', 'addressLine1', 'zipcode', 'agentAttorney'];
  }

  const conditions = searchFields.map(f => {
    if (f === 'phoneNumber' || f === 'zipcode') {
      const normalized = cleanedQuery;
      const original = trimmed;
      if (field) {
        // Match both normalized and dashed formats for suggestion clicks
        return {
          [f]: {
            $regex: new RegExp(`^${normalized}$|^${original}$`, 'i')
          }
        };
      }
      // For typed queries without field, match normalized or dashed formats
      return {
        [f]: {
          $regex: new RegExp(`^${normalized}$|^${normalized.match(/\d{5}-?\d{4}/) ? normalized : original.replace(/[-]/g, '')}$`, 'i')
        }
      };
    }
    return { [f]: { $regex: new RegExp(`^${trimmed}`, 'i') } };
  });

  try {
    console.log('Query:', trimmed, 'Cleaned:', cleanedQuery, 'Fields:', searchFields, 'Conditions:', conditions);
    const totalresult = await UserModel.countDocuments({ $or: conditions });
    console.log('total length:', totalresult);
    
    const results = await UserModel.find({ $or: conditions }).limit(20);
    if (!results.length) {
      console.log('No matches found for query:', trimmed);
      return res.status(404).json({ message: "No matching profiles found" });
    }
    // res.status(200).json(results);
    res.status(200).json({ results, total: totalresult });
  } catch (error) {
    console.error("❌ Error:", {
      message: error.message,
      stack: error.stack,
      query: trimmed,
      field: field,
      conditions: conditions
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/suggestions", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const trimmed = query.trim();
  const cleanedQuery = trimmed.replace(/[-.() ]/g, '');
  const isNumber = /^\d+$/.test(cleanedQuery);
  const queryLength = cleanedQuery.length;

  const alphaFields = ['name', 'organization', 'city', 'state', 'country', 'zipcode', 'addressLine1', 'agentAttorney'];
  const numFields = queryLength > 6 ? ['zipcode', 'phoneNumber'] : ['regCode', 'zipcode', 'phoneNumber'];

  let searchFields = isNumber ? numFields : alphaFields;
  let detectedFields = [];
  let suggestions = {};

  try {
    // Initialize suggestionSet early to avoid undefined errors
    const suggestionSet = new Map();
    searchFields.forEach(field => suggestionSet.set(field, new Set()));

    if (!isNumber && (trimmed.toLowerCase() === 'attorney' || trimmed.toLowerCase() === 'agent')) {
      const orConditions = [{
        agentAttorney: trimmed.toLowerCase() === 'attorney' ? 'ATTORNEY' : 'AGENT'
      }];
      const docs = await UserModel.find({ $or: orConditions })
        .limit(20)
        .select(['agentAttorney', '_id']);
      for (const doc of docs) {
        if (doc.agentAttorney) {
          suggestionSet.get('agentAttorney').add(doc.agentAttorney);
        }
      }
      detectedFields = ['agentAttorney'];
      suggestions['agentAttorney'] = Array.from(suggestionSet.get('agentAttorney')).slice(0, 10);
    } else if (isNumber) {
      // Suppress suggestions for >6-digit queries
      if (queryLength > 6) {
        const isPhoneNumber = /^(\d{10}|\d{3}-\d{3}-\d{4})$/.test(cleanedQuery);
        const isZipcode = /^(\d{9}|\d{5}-\d{4})$/.test(cleanedQuery);
        detectedFields = isPhoneNumber ? ['phoneNumber'] : isZipcode ? ['zipcode'] : ['zipcode', 'phoneNumber'];
        suggestions = {};
      } else {
        const orConditions = searchFields.map(field => ({
          [field]: { $regex: new RegExp(field === 'phoneNumber' || field === 'zipcode' ? `^${cleanedQuery}` : `^${trimmed}`, 'i') }
        }));

        const docs = await UserModel.find({ $or: orConditions })
          .limit(20)
          .select([...searchFields, '_id'].join(' '));

        for (const doc of docs) {
          for (const field of searchFields) {
            let fieldValue = doc[field];
            if (fieldValue && typeof fieldValue === 'string') {
              if (field === 'phoneNumber' || field === 'zipcode') {
                fieldValue = fieldValue.replace(/[-.() ]/g, '');
              }
              if (fieldValue.toLowerCase().startsWith(field === 'phoneNumber' || field === 'zipcode' ? cleanedQuery.toLowerCase() : trimmed.toLowerCase())) {
                suggestionSet.get(field).add(doc[field]); // Store original value with dashes
              }
            }
          }
        }

        if (queryLength <= 2) {
          if (suggestionSet.get('regCode').size > 0) {
            detectedFields = ['regCode'];
          } else if (suggestionSet.get('zipcode').size > 0) {
            detectedFields = ['zipcode'];
          } else if (suggestionSet.get('phoneNumber').size > 0) {
            detectedFields = ['phoneNumber'];
          }
        } else if (queryLength <= 5) {
          if (suggestionSet.get('regCode').size > 0) {
            detectedFields = ['regCode'];
            if (suggestionSet.get('zipcode').size > 0) {
              detectedFields.push('zipcode');
            }
          } else if (suggestionSet.get('zipcode').size > 0) {
            detectedFields = ['zipcode'];
            if (suggestionSet.get('phoneNumber').size > 0) {
              detectedFields.push('phoneNumber');
            }
          } else if (suggestionSet.get('phoneNumber').size > 0) {
            detectedFields = ['phoneNumber'];
          }
        }
      }
    } else {
      const orConditions = searchFields.map(field => ({
        [field]: { $regex: new RegExp(trimmed, 'i') }
      }));

      const docs = await UserModel.find({ $or: orConditions })
        .limit(20)
        .select([...searchFields, '_id'].join(' '));

      for (const doc of docs) {
        for (const field of searchFields) {
          if (
            doc[field] &&
            typeof doc[field] === 'string' &&
            doc[field].toLowerCase().includes(trimmed.toLowerCase())
          ) {
            suggestionSet.get(field).add(doc[field]);
          }
        }
      }

      if (queryLength === 1) {
        for (const field of alphaFields) {
          if (suggestionSet.get(field).size > 0) {
            detectedFields = [field];
            break;
          }
        }
      } else if (queryLength <= 3) {
        const exactMatchFields = [];
        const nonPrefixSuffixFields = [];
        const prefixSuffixFields = [];
        for (const field of alphaFields) {
          if (suggestionSet.get(field).size > 0) {
            const hasExactMatch = Array.from(suggestionSet.get(field)).some(value =>
              value.toLowerCase() === trimmed.toLowerCase() ||
              (field === 'state' && US_STATES.includes(trimmed.toLowerCase()))
            );
            if (hasExactMatch) {
              exactMatchFields.push(field);
            } else {
              const hasPrefixSuffix = Array.from(suggestionSet.get(field)).some(value =>
                value.toLowerCase() !== trimmed.toLowerCase() &&
                (value.toLowerCase().startsWith(trimmed.toLowerCase() + ' ') ||
                 value.toLowerCase().endsWith(' ' + trimmed.toLowerCase()))
              );
              if (!hasPrefixSuffix) {
                nonPrefixSuffixFields.push(field);
              } else {
                prefixSuffixFields.push(field);
              }
            }
          }
        }
        if (exactMatchFields.length > 0) {
          detectedFields = [exactMatchFields[0]];
        } else if (nonPrefixSuffixFields.length > 0) {
          detectedFields = [nonPrefixSuffixFields[0]];
        } else if (prefixSuffixFields.length > 0) {
          detectedFields = [prefixSuffixFields[0]];
        }
      } else {
        detectedFields = alphaFields.filter(field => suggestionSet.get(field).size > 0);
      }
    }

    detectedFields.forEach(field => {
      suggestions[field] = Array.from(suggestionSet.get(field)).slice(0, 10);
    });

    if (detectedFields.length === 0) {
      return res.json({ fields: [], suggestions: {} });
    }

    return res.json({
      fields: detectedFields,
      suggestions
    });
  } catch (err) {
    console.error("❌ Suggestion error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/FullDataAccess", async (req, res) => {
  const { query = '', page = 1 } = req.query;
  const trimmed = query.trim();
  const isNumber = /^\d+$/.test(trimmed);
  const pageNumber = parseInt(page, 10) || 1;
  const limit = 20;
  const skip = (pageNumber - 1) * limit;

  let searchFields = [];

  if (isNumber && trimmed.length >= 5) {
    searchFields = ['regCode'];
  } else {
    searchFields = ['name', 'organization', 'city', 'addressLine1', 'zipcode'];
  }

  const conditions = searchFields.map(field => ({
    [field]: { $regex: new RegExp(trimmed, 'i') }
  }));

  try {
    const filter = query ? { $or: conditions } : {}; // If empty, show all
    const results = await UserModel.find(filter).skip(skip).limit(limit);
    const totalCount = await UserModel.countDocuments(filter);

    res.status(200).json({ results, totalCount });
  } catch (err) {
    console.error("❌ FullDataAccess error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const profile = await UserModel.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/totaldbcount',async(req, res) =>{
  try{
    const totaldbcount = await UserModel.countDocuments();
    res.status(200).json({ count: totaldbcount });
  }catch(error){
    res.status(500).json({ message: 'Server error', error: error.message });
  }

});

module.exports = router;